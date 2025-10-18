import React, { forwardRef } from "react";
import {
  CheckCircle,
  Package,
  User,
  Calendar,
  MapPin,
  Hash,
  DollarSign,
} from "lucide-react";

export const ProductReceipt = forwardRef(({ product, farmer }, ref) => {
  if (!product || !farmer) return null;

  const hubFeeRate = 0.1;
  const totalValueRaw =
    parseFloat(product.quantity || 0) *
    parseFloat(product.pricePerUnit || product.price_per_unit || 0);
  const hubFee = totalValueRaw * hubFeeRate;
  const totalValue = totalValueRaw - hubFee;

  const currentDate = new Date(product.created_at || Date.now());

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: "#ffffff",
        color: "#000000",
        fontFamily: "Arial, sans-serif",
        padding: "1.5rem",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          paddingBottom: "1.5rem",
          borderBottom: "4px solid #059669",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.55rem",
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#059669",
              padding: "0.55rem",
              borderRadius: "9999px",
            }}
          >
            <Package size={26} style={{ color: "#ffffff" }} />
          </div>
          <h1
            style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#047857" }}
          >
            Farmer Trade Hub
          </h1>
        </div>
        <p style={{ fontSize: "1.10rem", fontWeight: 600, color: "#374151" }}>
          Product Registration Receipt
        </p>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            marginTop: "0.25rem",
          }}
        >
          Official Transaction Document
        </p>
      </div>

      {/* Receipt Info Bar */}
      <div
        style={{
          backgroundColor: "#ecfdf5",
          border: "2px solid #d1fae5",
          borderRadius: "0.75rem",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.25rem",
                color: "#4b5563",
              }}
            >
              <Hash size={16} />
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                Receipt Number
              </span>
            </div>
            <p
              style={{
                fontSize: "1.105rem",
                fontWeight: "bold",
                color: "#047857",
              }}
            >
              {product.lot_code || product.lotCode || `REC-${Date.now()}`}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "0.3rem",
                marginBottom: "0.15rem",
                color: "#4b5563",
              }}
            >
              <Calendar size={16} />
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                Date & Time
              </span>
            </div>
            <p
              style={{
                fontSize: "1.125rem",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              {currentDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              {currentDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Farmer Info */}
        <div
          style={{
            border: "2px solid #d1d5db",
            borderRadius: "0.75rem",
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
              paddingBottom: "0.5rem",
              borderBottom: "2px solid #059669",
            }}
          >
            <User size={20} style={{ color: "#059669" }} />
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              Farmer Information
            </h3>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.600rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: "0.25rem",
                }}
              >
                Full Name
              </p>
              <p
                style={{ fontSize: "1rem", fontWeight: 600, color: "#111827" }}
              >
                {farmer.full_name || farmer.name}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: "0.25rem",
                }}
              >
                Phone Number
              </p>
              <p style={{ fontSize: "1rem", color: "#374151" }}>
                {farmer.phone}
              </p>
            </div>
            {farmer.location && (
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-start",
                }}
              >
                <MapPin
                  size={16}
                  style={{ color: "#9ca3af", marginTop: "0.25rem" }}
                />
                <div>
                  <p
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Location
                  </p>
                  <p style={{ fontSize: "1rem", color: "#374151" }}>
                    {farmer.location}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div
          style={{
            border: "2px solid #d1d5db",
            borderRadius: "0.75rem",
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
              paddingBottom: "0.5rem",
              borderBottom: "2px solid #059669",
            }}
          >
            <Package size={20} style={{ color: "#059669" }} />
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              Product Information
            </h3>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.605rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: "0.25rem",
                }}
              >
                Product Name
              </p>
              <p
                style={{ fontSize: "1rem", fontWeight: 600, color: "#111827" }}
              >
                {product.produceName || product.produce_name}
              </p>
            </div>
            {product.category && (
              <div>
                <p
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "#6b7280",
                    marginBottom: "0.25rem",
                  }}
                >
                  Category
                </p>
                <p style={{ fontSize: "1rem", color: "#374151" }}>
                  {product.category}
                </p>
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.65rem",
                paddingTop: "0.3rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "#6b7280",
                    marginBottom: "0.25rem",
                  }}
                >
                  Quantity
                </p>
                <p
                  style={{
                    fontSize: "1.105rem",
                    fontWeight: "bold",
                    color: "#059669",
                  }}
                >
                  {product.quantity} {product.unit}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "#6b7280",
                    marginBottom: "0.25rem",
                  }}
                >
                  Unit Price
                </p>
                <p
                  style={{
                    fontSize: "1.105rem",
                    fontWeight: "bold",
                    color: "#059669",
                  }}
                >
                  {(
                    product.pricePerUnit || product.price_per_unit
                  ).toLocaleString()}{" "}
                  Rwf
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {product.notes && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            backgroundColor: "#f0fdf4",
            border: "1px solid #d1fae5",
            borderRadius: "0.75rem",
          }}
        >
          <p
            style={{
              fontSize: "0.625rem",
              fontWeight: 600,
              textTransform: "uppercase",
              color: "#6b7280",
              marginBottom: "0.10rem",
            }}
          >
            Notes
          </p>
          <p style={{ fontSize: "0.775rem", color: "#374151" }}>
            {product.notes}
          </p>
        </div>
      )}

      {/* Total */}
      <div
        style={{
          backgroundColor: "#f0fdf4", // subtle light green for professional feel
          borderRadius: "0.75rem",
          padding: "1.5rem",
          marginBottom: "1rem",
          fontFamily: "Arial, sans-serif",
          color: "#111827",
        }}
      >
        {/* Hub Fees */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0.5rem 0",
            borderBottom: "1px dashed #d1fae5",
            fontWeight: "600",
            fontSize: "0.95rem",
          }}
        >
          <span>Hub Fees</span>
          <span>{parseFloat(hubFee).toLocaleString()} Rwf</span>
        </div>

        {/* Total Transaction Value */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0.1rem 0",
            borderBottom: "1px dashed #d1fae5",
            fontWeight: "600",
            fontSize: "0.95rem",
          }}
        >
          <span>Total Amount Before Fees</span>
          <span>{parseFloat(totalValueRaw).toLocaleString()} Rwf</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0.1rem 0",
            borderBottom: "1px dashed #d1fae5",
            fontWeight: "600",
            fontSize: "0.95rem",
          }}
        >
          <span>Total Transaction Value After Charge</span>
          <span>{parseFloat(totalValue).toLocaleString()} Rwf</span>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "2px solid #d1d5db",
          paddingTop: "1.2rem",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "#6b7280",
        }}
      >
        <p>This is an official receipt generated by Farmer Trade Hub system</p>
        <p>
          © {new Date().getFullYear()} Farmer Trade Hub. All Rights Reserved.
        </p>
        <p>For inquiries, please contact support@farmertradehub.com</p>
      </div>
    </div>
  );
});
