import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Page } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import StyleOptionCard from "../components/StyleOptionCard";
import { generateVideo } from "../api/api.js"; // Assuming you have an API module for generating videos
import "../style/product.css";
import "../style/gallery.css";
import { AlignLeftIcon } from "lucide-react";

const templates = [
  {
    id: "template-1",
    name: "Clothing Spin View",
    description:
      "Front-to-back model spin with stable camera and minimal background.",
    prompt:
      "Create a spin video starting with a full-body front view of a person wearing this clothes. Begin with the front-facing image, then the model slowly rotates to reveal the back-facing view. Lighting should remain consistent and natural. Background should stay minimal and unobtrusive to keep focus on the clothing.Camera is on a tripod. Maintain consistent posture and scale between both angles. Clothing should appear realistic, with natural fabric movement where possible. Must show the full body all the time.",
    duration: "5s",
    sampleVideo: "https://172.105.3.20/static/template-01.mp4",
    style: "Realistic, clean, minimalistic, studio-lit, fashion catalog.",
  },
  {
    id: "template-2",
    name: "Subtle Model Pose Loop",
    description: "Minimal model motion with soft lighting and editorial style.",
    prompt:
      "The model should remain mostly still with minimal movement: gentle blinks, slight shifts of posture, subtle sway. Ensure the hands stay in place to reduce visual distractions. Keep the style modern, calm, and editorial. Maintain shallow depth of field and soft lighting to give a high-fashion, e-commerce-ready aesthetic. Must show the full body all the time.",
    duration: "5s",
    sampleVideo: "https://172.105.3.20/static/template-02.mp4",
    style:
      "Modern, calm, high-fashion, shallow depth of field, soft-lit, e-commerce editorial.",
  },
  {
    id: "template-3",
    name: "Editorial Push-In Portrait",
    description:
      "Subtle camera push-in on a still model with soft, modern aesthetic.",
    prompt:
      "Use a subtle push-in movement on the camera. The model should remain mostly still with minimal movement: slight shifts of posture, subtle sway. Ensure the hands stay in place to reduce visual distractions. Keep the style modern, calm, and editorial. Maintain shallow depth of field and soft lighting to give a high-fashion, e-commerce-ready aesthetic. Must show the full body all the time.",
    duration: "5s",
    sampleVideo: "https://172.105.3.20/static/template-03.mp4",
    style:
      "Calm, modern, editorial, shallow depth of field, soft lighting, high-fashion, e-commerce-ready.",
  },
  {
    id: "template-4",
    name: "Custom",
    description: "Create your own unique style with a custom prompt",
    prompt: "",
    duration: "5s",
    style: "Custom",
  },
];

const SparklesIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l1.665 5.125L19 9l-5.335.875L12 15l-1.665-5.125L5 9l5.335-.875L12 3z" />
    <path d="M12 15l1.665 5.125L19 21l-5.335-.875L12 15l-1.665 5.125L5 21l5.335.875L12 15z" />
  </svg>
);

const UploadIcon = () => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17,8 12,3 7,8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const GridIcon = () => (
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
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

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

const PackageIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 4.262 7 7.05c0 1.96 1.647 3.95 5 3.95s5-1.99 5-3.95c0-2.788-2.239-5.05-5-5.05z"></path>
    <path d="M12 17.5c-3.353 0-5-1.99-5-3.95 0-2.788 2.239-5.05 5-5.05s5 2.262 5 5.05c0 1.96-1.647 3.95-5 3.95z"></path>
    <path d="M12 22c-3.353 0-5-1.99-5-3.95 0-2.788 2.239-5.05 5-5.05s5 2.262 5 5.05c0 1.96-1.647 3.95-5 3.95z"></path>
  </svg>
);

const ImageIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21,15 16,10 5,21"></polyline>
  </svg>
);

const XIcon = () => (
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
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
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
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

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
    if (productImages.length === 0) {
      alert("Please upload at least one image");
      return;
    }
    if (productImages.length > 4) {
      alert("Please upload up to four images");
      return;
    }
    if (!selectedTemplate) {
      alert("Please select a template");
      return;
    }
    console.log(selectedProduct, selectedTemplate, productImages, shop);
    try {
      setIsGenerating(true);
      const res = await generateVideo(
        selectedProduct.node.id,
        productImages,
        selectedTemplate,
        shop,
      );
      setProductImages([]);
      setSelectedTemplate(null);
      setSelectedProduct(null);
      navigate("/app/gallery");
    } catch (error) {
      const status = error?.response?.status;
      if (status == 429) {
        alert("Too many requests. Please try again later.");
      } else {
        alert(
          "An error occurred while generating the video. Please try again.",
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };
  // === PRODUCT PICKER MODE ===
  return (
    <div className="product-page">
      <Page>
        <div className="header">
          <div className="header-content">
            <div className="header-logo">
              <div>
                <h1 className="header-title">
                  Video Generator for Shopify Product
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="shopify-product-selector">
          {!selectedProduct ? (
            <>
              {/* Search */}
              <div className="search-container">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Products Grid */}
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.node.id}
                    className="product-card"
                    onClick={() => {
                      setSelectedProduct(product);
                      setProductImages(
                        product.node.images.edges.map((image) => ({
                          id: image.node.id,
                          url: image.node.url,
                          altText: image.node.altText || "Product image",
                        })),
                      );
                    }}
                  >
                    <div className="product-content">
                      <div className="product-image">
                        {product.node.featuredImage.url ? (
                          <img
                            src={product.node.featuredImage.url}
                            alt={product.node.title}
                            className="product-featured-image"
                          />
                        ) : (
                          <div className="product-placeholder">
                            <PackageIcon />
                          </div>
                        )}
                      </div>
                      <h3 className="product-title">{product.node.title}</h3>
                      <p className="product-image-count">
                        {product.node.images.edges.length} image
                        {product.node.images.edges.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Selected Product Info */}
              <Card className="selected-product-card">
                <div className="selected-product-content">
                  <div className="selected-product-image">
                    {selectedProduct.node.featuredImage.url ? (
                      <img
                        src={selectedProduct.node.featuredImage.url}
                        alt={selectedProduct.node.title}
                        className="product-featured-image"
                      />
                    ) : (
                      <div className="product-placeholder">
                        <PackageIcon />
                      </div>
                    )}
                  </div>
                  <div className="selected-product-info">
                    <h3 className="product-title">
                      {selectedProduct.node.title}
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(null);
                      setProductImages([]);
                    }}
                  >
                    Change Product
                  </Button>
                </div>
              </Card>

              {/* Selected Images */}
              {productImages.length > 0 && (
                <div className="selected-images-section">
                  <h4 className="selected-images-title">
                    Product Images ({productImages.length}) - Leave Up to 4
                    images
                  </h4>
                  <div className="selected-images-grid">
                    {productImages.map((image) => (
                      <div key={image.id} className="selected-image-item">
                        <Card className="selected-image-card">
                          <div className="selected-image-container">
                            <img
                              src={image.url}
                              alt={image.altText || "Product image"}
                              className="selected-image"
                            />
                          </div>
                          <p className="selected-image-alt">
                            {image.altText || "Product image"}
                          </p>
                        </Card>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="remove-image-button"
                          onClick={() => {
                            const newImages = productImages.filter(
                              (img) => img.id !== image.id,
                            );
                            setProductImages(newImages);
                          }}
                        >
                          <XIcon />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="template-selector-container">
                <div className="template-selector-header">
                  <h3 className="template-selector-title">
                    Choose Video Template
                  </h3>
                  <p className="template-selector-description">
                    Select a style for your video generation
                  </p>
                </div>

                <div className="template-grid">
                  {templates.map((template) => (
                    <Card
                      style={{
                        alignItems: `${template.id === "template-4" ? "center" : "flex-start"}`,
                      }}
                      key={template.id}
                      className={`template-card ${selectedTemplate?.id === template.id ? "template-selected" : ""}`}
                      onMouseEnter={() => setHoveredTemplate(template.id)}
                      onMouseLeave={() => setHoveredTemplate(null)}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      {selectedTemplate?.id === template.id && (
                        <div className="template-check-icon">
                          <div className="check-background">
                            <CheckIcon />
                          </div>
                        </div>
                      )}

                      <div className="template-content">
                        {template.sampleVideo && (
                          <div className="template-video-container">
                            <video
                              src={template.sampleVideo}
                              className="template-video"
                              autoPlay
                              loop
                              muted
                              playsInline
                            />
                          </div>
                        )}

                        <div className="template-info">
                          <h4 className="template-name">{template.name}</h4>
                          <p className="template-description">
                            {template.description}
                          </p>

                          <div className="template-badges">
                            <Badge variant="secondary">
                              {template.duration}
                            </Badge>
                            <Badge variant="outline">{template.style}</Badge>
                          </div>
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
                        Describe your custom style:
                      </label>
                      <textarea
                        id="custom-prompt"
                        value={selectedTemplate.prompt}
                        onChange={(e) => {
                          setCustomPrompt(e.target.value);
                          setSelectedTemplate({
                            ...selectedTemplate,
                            prompt: e.target.value,
                          });
                        }}
                        placeholder="e.g., Retro 80s neon style with synthwave aesthetics and glowing effects..."
                        className="custom-prompt-textarea"
                      />
                    </div>
                  </Card>
                )}

                {selectedTemplate && (
                  <Card className="selected-template-card">
                    <div className="selected-template-content">
                      <div>
                        <h4 className="selected-template-name">
                          {selectedTemplate.name} Template Selected
                        </h4>
                        <p className="selected-template-description">
                          {selectedTemplate.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {productImages.length > 0 && selectedTemplate && (
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
                        Generate Video
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Page>
    </div>
  );
}
