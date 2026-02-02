import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  noIndex?: boolean;
}

export const SEOHead = ({
  title = 'HostClick - Free WordPress Hosting',
  description = 'Get free WordPress hosting with your own subdomain. Click daily to earn hosting days and keep your site online.',
  keywords = 'free wordpress hosting, free hosting, wordpress, subdomain, hostclick',
  ogImage = '/og-image.png',
  ogUrl,
  noIndex = false,
}: SEOHeadProps) => {
  const fullTitle = title.includes('HostClick') ? title : `${title} | HostClick`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Language */}
      <link rel="alternate" hrefLang="en" href="https://hostclick.am" />
      <link rel="alternate" hrefLang="hy" href="https://hostclick.am?lang=hy" />
    </Helmet>
  );
};
