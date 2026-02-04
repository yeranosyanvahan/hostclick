from kubernetes import client, config
from kubernetes.dynamic import DynamicClient
from kubernetes.dynamic.exceptions import NotFoundError
from kubernetes import config
from kubernetes.client import ApiClient
from kubernetes.dynamic import DynamicClient
from kubernetes.dynamic.exceptions import NotFoundError
from jinja2 import Environment, FileSystemLoader
import yaml
import os

class HelmTemplates:
    # -----------------------------
    # Class-level Jinja environment
    # -----------------------------
    env = Environment(loader=FileSystemLoader("templates"))

    @staticmethod
    def _get_namespace():
        """Read current pod namespace"""
        ns_path = "/var/run/secrets/kubernetes.io/serviceaccount/namespace"
        if os.path.exists(ns_path):
            with open(ns_path) as f:
                return f.read().strip()
        return "default"

    @staticmethod
    def _render(template_name, **context):
        """Render a template with common context (namespace, etc)"""
        namespace = HelmTemplates._get_namespace()
        context.setdefault("namespace", namespace)
        template = HelmTemplates.env.get_template(template_name)
        return template.render(**context)

    # -----------------------------
    # Templates
    # -----------------------------
    @staticmethod
    def ingress(vhostname, backend):
        return HelmTemplates._render(
            "ingress.yaml.j2",
            vhostname=vhostname,
            backend=backend
        )

    @staticmethod
    def wordpress(vhostname, enabled: bool):
        return HelmTemplates._render(
            "wordpress.yaml.j2",
            vhostname=vhostname,
            replicas=1 if enabled else 0,
            ingress={"enabled": enabled}
        )

    @staticmethod
    def ingress_with_name(vhostname, backend, name):
        return HelmTemplates._render(
            "ingress.yaml.j2",
            vhostname=vhostname,
            backend=backend,
            name=name
        )

    @staticmethod
    def wordpress_with_name(vhostname, enabled: bool,name):
        return HelmTemplates._render(
            "wordpress.yaml.j2",
            vhostname=vhostname,
            replicas=1 if enabled else 0,
            ingress={"enabled": enabled},
            name=name
        )

    # -----------------------------
    # Kubernetes apply/delete
    # -----------------------------
    @staticmethod
    def apply(rendered_yaml: str):

        # Load config from cluster or kubeconfig
        try:
            config.load_incluster_config()
        except:
            from kubernetes.config import load_kube_config
            load_kube_config()

        client = DynamicClient(ApiClient())
        doc = yaml.safe_load(rendered_yaml)
        if not doc:
            return

        api_version = doc["apiVersion"]
        kind = doc["kind"]
        metadata = doc.get("metadata", {})
        name = metadata["name"]
        namespace = metadata.get("namespace")

        # Split apiVersion into group/version
        if "/" in api_version:
            group, version = api_version.split("/")
        else:
            group = ""
            version = api_version

        resource = client.resources.get(api_version=version, kind=kind, group=group)

        try:
            # Try fetching resource to check if it exists
            if resource.namespaced:
                resource.get(name=name, namespace=namespace)
                resource.patch(
                    name=name,
                    namespace=namespace,
                    body=doc,
                    content_type="application/merge-patch+json",
                )
            else:
                resource.get(name=name)
                resource.patch(
                    name=name,
                    body=doc,
                    content_type="application/merge-patch+json",
                )

        except NotFoundError:
            # If resource not found, create it
            if resource.namespaced:
                resource.create(body=doc, namespace=namespace)
            else:
                resource.create(body=doc)
    @staticmethod
    def delete(rendered_yaml: str):
        import yaml
        from kubernetes import config
        from kubernetes.client import ApiClient
        from kubernetes.dynamic import DynamicClient
        from kubernetes.dynamic.exceptions import NotFoundError

        # Load cluster config or local kubeconfig
        try:
            config.load_incluster_config()
        except:
            from kubernetes.config import load_kube_config
            load_kube_config()

        client = DynamicClient(ApiClient())
        doc = yaml.safe_load(rendered_yaml)
        if not doc:
            return

        api_version = doc["apiVersion"]
        kind = doc["kind"]
        metadata = doc.get("metadata", {})
        name = metadata["name"]
        namespace = metadata.get("namespace")

        # Split apiVersion into group/version
        if "/" in api_version:
            group, version = api_version.split("/")
        else:
            group = ""
            version = api_version

        resource = client.resources.get(api_version=version, kind=kind, group=group)

        try:
            if resource.namespaced and namespace:
                resource.delete(name=name, namespace=namespace)
            else:
                resource.delete(name=name)
        except NotFoundError:
            # Resource already deleted or doesn't exist
            pass