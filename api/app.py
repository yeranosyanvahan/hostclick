from flask import Flask, request
from helmtemplates import HelmTemplates
import logging
import json
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("KapiService")

SERVICE_NAME = os.environ.get("SERVICE_NAME")

app = Flask(__name__)


def handle_request(suspended: bool):
    payload = request.get_json(silent=True)
    if not payload:
        return {"status": "ignored", "reason": "no JSON body"}

    logger.info(json.dumps(payload, indent=2))

    vhostname = f"""{payload.get("subdomain")}.hostclick.am"""
    if not vhostname:
        return {"status": "ignored", "reason": "missing subdomain"}

    ingress_yaml = HelmTemplates.ingress(
        vhostname=vhostname,
        backend=SERVICE_NAME,
    )

    app_yaml = HelmTemplates.wordpress(
        vhostname=vhostname,
        enabled=not suspended,
    )

    HelmTemplates.apply(app_yaml)

    if suspended:
        HelmTemplates.apply(ingress_yaml)
        logger.info(f"Suspended wordpress on {vhostname}")
    else:
        HelmTemplates.delete(ingress_yaml)
        logger.info(f"Unsuspended wordpress on {vhostname}")

    return {"status": "ok"}


@app.route("/api/v1/webhooks/suspend", methods=["POST"])
def suspend():
    return handle_request(suspended=True)


@app.route("/api/v1/webhooks/unsuspend", methods=["POST"])
def unsuspend():
    return handle_request(suspended=False)


def handle_request_raw(suspended: bool):
    payload = request.get_json(silent=True)
    if not payload:
        return {"status": "ignored", "reason": "no JSON body"}

    logger.info(json.dumps(payload, indent=2))

    vhostname = payload.get("domain")
    name = payload.get("name")
    if not vhostname:
        return {"status": "ignored", "reason": "missing subdomain"}

    ingress_yaml = HelmTemplates.ingress(
        vhostname=vhostname,
        backend=SERVICE_NAME,
        name=name,
    )

    app_yaml = HelmTemplates.wordpress(
        vhostname=vhostname,
        enabled=not suspended,
        name=name,
    )

    HelmTemplates.apply(app_yaml)

    if suspended:
        HelmTemplates.apply(ingress_yaml)
        logger.info(f"Suspended wordpress on {vhostname}")
    else:
        HelmTemplates.delete(ingress_yaml)
        logger.info(f"Unsuspended wordpress on {vhostname}")

    return {"status": "ok"}


@app.route("/api/v1/webhooks/raw/suspend", methods=["POST"])
def suspend_raw():
    return handle_request_raw(suspended=True)


@app.route("/api/v1/webhooks/raw/unsuspend", methods=["POST"])
def unsuspend_raw():
    return handle_request_raw(suspended=False)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
