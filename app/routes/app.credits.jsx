import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Page } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import { buyCredits, generateVideo, getCredits } from "../api/api.js"; // Assuming you have an API module for generating videos
import "../style/product.css";
import "../style/gallery.css";

const templates = [
  {
    id: "template-1",
    name: "100 Credits",
    description:
      "Front-to-back model spin with stable camera and minimal background.",
    prompt:
      "Create a spin video starting with a full-body front view of a person wearing this clothes. Begin with the front-facing image, then the model slowly rotates to reveal the back-facing view. Lighting should remain consistent and natural. Background should stay minimal and unobtrusive to keep focus on the clothing.Camera is on a tripod. Maintain consistent posture and scale between both angles. Clothing should appear realistic, with natural fabric movement where possible. Must show the full body all the time.",
    duration: "$140",
    sampleVideo: "https://172.105.3.20/static/template-01.mp4",
    style: "1 Month Available",
  },
  {
    id: "template-2",
    name: "250 Credits",
    description: "Minimal model motion with soft lighting and editorial style.",
    prompt:
      "The model should remain mostly still with minimal movement: gentle blinks, slight shifts of posture, subtle sway. Ensure the hands stay in place to reduce visual distractions. Keep the style modern, calm, and editorial. Maintain shallow depth of field and soft lighting to give a high-fashion, e-commerce-ready aesthetic. Must show the full body all the time.",
    duration: "$350",
    sampleVideo: "https://172.105.3.20/static/template-02.mp4",
    style: "1 Month Available",
  },
  {
    id: "template-3",
    name: "500 Credits",
    description:
      "Subtle camera push-in on a still model with soft, modern aesthetic.",
    prompt:
      "Use a subtle push-in movement on the camera. The model should remain mostly still with minimal movement: slight shifts of posture, subtle sway. Ensure the hands stay in place to reduce visual distractions. Keep the style modern, calm, and editorial. Maintain shallow depth of field and soft lighting to give a high-fashion, e-commerce-ready aesthetic. Must show the full body all the time.",
    duration: "$700",
    sampleVideo: "https://172.105.3.20/static/template-03.mp4",
    style: "1 Month Available",
  },
  {
    id: "template-4",
    name: "Custom",
    description: "Create your own unique style with a custom prompt",
    prompt: "",
    duration: "$1.5 per credit",
    style: "Always Available",
  },
];

const VideoIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="23,7 16,12 23,17 23,7"></polygon>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
  </svg>
);

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const Button = ({
  className = "",
  variant = "default",
  size = "default",
  children,
  ...props
}) => {
  const baseClasses = "button";
  const variantClasses = {
    default: "button-default",
    secondary: "button-secondary",
    outline: "button-outline",
    ghost: "button-ghost",
    destructive: "button-destructive",
  };
  const sizeClasses = {
    default: "button-default-size",
    sm: "button-sm",
    lg: "button-lg",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

// Card component
const Card = ({ className = "", children, ...props }) => {
  const classes = `card ${className}`;
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Badge component
const Badge = ({ className = "", variant = "default", children, ...props }) => {
  const baseClasses = "badge";
  const variantClasses = {
    default: "badge-default",
    secondary: "badge-secondary",
    destructive: "badge-destructive",
    outline: "badge-outline",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20,6 9,17 4,12"></polyline>
  </svg>
);
// === LOADER ===
export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const accessToken = session.accessToken;
  const shop = session.shop;
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";

  const gql = query.trim()
    ? `
      query ProductsByTitle($title: String!) {
        products(first: 20, query: $title) {
          edges {
            node {
              id
              title
              totalInventory
              featuredImage { url altText }
              images(first: 10) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }`
    : `
      query Products($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              totalInventory
              featuredImage { url altText }
              images(first: 10) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }`;

  const resp = await admin.graphql(gql, {
    variables: query ? { title: `title:*${query}*` } : { first: 20 },
  });

  const { data } = await resp.json();
  return json({ products: data.products, shop: shop });
}

// === COMPONENT ===
export default function ProductsPage() {
  const navigate = useNavigate();
  const { products, shop } = useLoaderData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(
    products.edges || [],
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState(1);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [creditStatus, setCreditStatus] = useState({});

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const res = await getCredits(shop);
      console.log(res);
      setCreditStatus(res.data);
    } catch (error) {
      console.error("Error loading credits:", error);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchParams((q) => {
        if (query) q.set("query", query);
        else q.delete("query");
        return q;
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, setSearchParams]);

  useEffect(() => {
    console.log(products);
    const filtered = products.edges.filter((product) =>
      product.node.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredProducts(filtered);
    console.log("filtered", filtered);
  }, [searchTerm, products]);

  const handleGenerateVideo = async () => {
    try {
      console.log(window.location);
      const redirectUrl = `https://admin.shopify.com/store/${shop.split(".")[0]}/apps/ad-video-generator-1/${window.location.pathname}${window.location.search}`;
      console.log(redirectUrl);
      await buyCredits(shop, selectedTemplate.id, credits, redirectUrl);
    } catch (error) {
    } finally {
    }
  };
  // === PRODUCT PICKER MODE ===
  return (
    <div className="product-page">
      <Page>
        <div className="header">
          <div className="header-content">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="header-logo">
                <h1 className="header-title">
                  Video Generator for Shopify Product
                </h1>
              </div>
              <div
                style={{
                  fontSize: "14px",
                }}
              >
                <div>
                  Subscription Credits: {creditStatus?.monthly_credit ?? 0}
                </div>
                <div>
                  Next Renewal:{" "}
                  {creditStatus?.subscription_expired
                    ? creditStatus?.subscription_expired.substring(0, 10)
                    : ""}
                </div>
                <div>Top-up Credits: {creditStatus?.extra_credit ?? 0}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="shopify-product-selector">
          <div className="template-selector-container">
            <div className="template-selector-header">
              <h3 className="template-selector-title">Choose Plans</h3>
              <p className="template-selector-description">
                Select plans for your video generation
              </p>
            </div>

            <div className="template-grid">
              {templates.map((template) => (
                <Card
                  style={{
                    cursor: `${template.id === "template-4" || creditStatus?.active_subscription === false ? "pointer" : "not-allowed"}`,
                  }}
                  key={template.id}
                  className={`template-card ${selectedTemplate?.id === template.id ? "template-selected" : ""}`}
                  onMouseEnter={() => {
                    if (
                      template.id === "template-4" ||
                      creditStatus?.active_subscription === false
                    )
                      setHoveredTemplate(template.id);
                  }}
                  onMouseLeave={() => {
                    if (
                      template.id === "template-4" ||
                      creditStatus?.active_subscription === false
                    )
                      setHoveredTemplate(null);
                  }}
                  onClick={() => {
                    if (
                      template.id === "template-4" ||
                      creditStatus?.active_subscription === false
                    )
                      setSelectedTemplate(template);
                  }}
                >
                  {selectedTemplate?.id === template.id && (
                    <div className="template-check-icon">
                      <div className="check-background">
                        <CheckIcon />
                      </div>
                    </div>
                  )}

                  <div className="template-content">
                    <div className="template-info">
                      <h4 className="template-name">{template.name}</h4>
                      <div className="template-badges">
                        <Badge variant="secondary">{template.duration}</Badge>
                      </div>
                      {template.id !== "template-4" ? (
                        <ul
                          style={{
                            alignItems: "flex-start",
                            listStyleType: "none",
                            textAlign: "left",
                          }}
                          className="features"
                        >
                          <li>$1.4 per video</li>
                          <li>Fast-track generation</li>
                          <li>Professional mode</li>
                          <li>One month available</li>
                        </ul>
                      ) : (
                        <ul
                          style={{
                            alignItems: "flex-start",
                            listStyleType: "none",
                            textAlign: "left",
                          }}
                          className="features"
                        >
                          <li>$1.5 per video</li>
                          <li>Fast-track generation</li>
                          <li>Professional mode</li>
                          <li>One month available</li>
                        </ul>
                      )}
                      <div className="template-badges">
                        <Badge variant="outline">{template.style}</Badge>
                      </div>
                      {template.id.split("-")[1] ==
                        creditStatus?.subscription_type &&
                        creditStatus?.active_subscription && (
                          <Badge
                            variant="destructive"
                            style={{
                              align: "center",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            Your Current Plan
                          </Badge>
                        )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {selectedTemplate && selectedTemplate.id === "template-4" && (
              <Card className="custom-prompt-card">
                <div className="custom-prompt-content">
                  <label
                    htmlFor="custom-prompt"
                    className="custom-prompt-label"
                  >
                    Input the number of credits you want to buy:{" "}
                    <span
                      style={{
                        fontStyle: "italic",
                        fontSize: "16px",
                      }}
                    >
                      Total ${1.5 * credits}
                    </span>
                  </label>
                  <input
                    id="custom-prompt"
                    type="number"
                    min="1"
                    max="1000"
                    value={credits}
                    onChange={(e) => {
                      setCredits(e.target.value);
                    }}
                    className="custom-prompt-textarea"
                    style={{
                      color: "#FFF",
                    }}
                  />
                </div>
              </Card>
            )}

            {selectedTemplate && (
              <Card className="selected-template-card">
                <div className="selected-template-content">
                  <div>
                    <h4 className="selected-template-name">
                      {selectedTemplate.name} Plan Selected
                    </h4>
                  </div>
                </div>
              </Card>
            )}
          </div>
          {selectedTemplate && (
            <div className="generate-section">
              <Button
                size="lg"
                onClick={handleGenerateVideo}
                disabled={isGenerating}
                className="generate-button"
              >
                {isGenerating ? (
                  <>
                    <div className="loading-spinner" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <VideoIcon />
                    Purchase
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </Page>
    </div>
  );
}
