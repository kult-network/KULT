import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, slug }) => {
    const siteTitle = 'KULT Network | Scaling Engineering Intelligence';
    const baseUrl = 'https://kultnetwork.in';
    const fullUrl = slug ? `${baseUrl}/${slug}` : baseUrl;
    const metaTitle = title ? `${title} | KULT Network` : siteTitle;
    const metaDescription = description || 'KULT Network is a high-octane intelligence platform mapping global missions, providing decentralized access to high-impact events and elite technical circles.';

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            {image && <meta name="twitter:image" content={image} />}
        </Helmet>
    );
};

export default SEO;
