import { BUSINESS } from "./constants";

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoWash",
    "@id": `${BUSINESS.url}/#business`,
    name: BUSINESS.name,
    description: BUSINESS.description,
    url: BUSINESS.url,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.region,
      addressCountry: BUSINESS.address.country
    },
    geo: { "@type": "GeoCoordinates", latitude: "41.5463", longitude: "2.1086" },
    priceRange: "€€",
    sameAs: [`https://wa.me/${BUSINESS.whatsapp}`]
  };
}

export function generateWebSiteSchema() {
  return { "@context":"https://schema.org","@type":"WebSite","@id":`${BUSINESS.url}/#website`, url: BUSINESS.url, name: BUSINESS.name };
}
