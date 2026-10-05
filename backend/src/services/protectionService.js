const crypto = require("crypto");

const actionMap = {
  allow: {
    action: "ALLOWED",
    blocked: false,
    protected: false,
  },

  redact: {
    action: "REDACTED",
    blocked: false,
    protected: true,
  },

  mask: {
    action: "REDACTED",
    blocked: false,
    protected: true,
  },

  anonymize: {
    action: "ANONYMIZED",
    blocked: false,
    protected: true,
  },

  tokenize: {
    action: "REDACTED",
    blocked: false,
    protected: true,
  },

  block: {
    action: "BLOCKED",
    blocked: true,
    protected: true,
  },
};

// --------------------------------------------------
// Replacement Generator
// --------------------------------------------------

const getReplacement = (
  type,
  action,
  value
) => {
  const replacements = {
    email: "[EMAIL_REDACTED]",
    phone: "[PHONE_REDACTED]",
    creditCard: "[CARD_BLOCKED]",
    pan: "[PAN_REDACTED]",
    aadhaar: "[AADHAAR_REDACTED]",
    apiKey: "[API_KEY_BLOCKED]",
    password: "[PASSWORD_BLOCKED]",
    person: "[PERSON_ANONYMIZED]",
    organization: "[ORGANIZATION_REDACTED]",
    health: "[HEALTH_DATA_BLOCKED]",
    financial: "[FINANCIAL_DATA_BLOCKED]",
    credential: "[CREDENTIAL_BLOCKED]",
    upiId: "[UPI_REDACTED]",
  };

  if (action === "allow") {
    return null;
  }

  if (action === "block") {
    return (
      replacements[type] ||
      "[SENSITIVE_DATA_BLOCKED]"
    );
  }

  if (action === "anonymize") {
    return "[PERSON_ANONYMIZED]";
  }

  if (action === "mask") {
    return maskValue(type, value);
  }

  if (action === "tokenize") {
    return createToken(value);
  }

  return (
    replacements[type] ||
    "[SENSITIVE_DATA_REDACTED]"
  );
};

// --------------------------------------------------
// Masking
// --------------------------------------------------

const maskValue = (
  type,
  value
) => {
  if (
    typeof value !== "string" ||
    !value
  ) {
    return "[MASKED]";
  }

  // Email
  if (type === "email") {
    const parts =
      value.split("@");

    if (
      parts.length === 2
    ) {
      const username =
        parts[0];

      const domain =
        parts[1];

      const visible =
        username
          .slice(0, 2);

      return `${visible}***@${domain}`;
    }
  }

  // Phone
  if (type === "phone") {
    const digits =
      value.replace(
        /\D/g,
        ""
      );

    if (
      digits.length >= 4
    ) {
      return `******${digits.slice(
        -4
      )}`;
    }
  }

  // Card
  if (type === "creditCard") {
    const digits =
      value.replace(
        /\D/g,
        ""
      );

    if (
      digits.length >= 4
    ) {
      return `**** **** **** ${digits.slice(
        -4
      )}`;
    }
  }

  // Aadhaar
  if (type === "aadhaar") {
    const digits =
      value.replace(
        /\D/g,
        ""
      );

    if (
      digits.length >= 4
    ) {
      return `XXXX XXXX ${digits.slice(
        -4
      )}`;
    }
  }

  // Generic masking
  if (value.length <= 4) {
    return "*".repeat(
      value.length
    );
  }

  return (
    value.slice(0, 2) +
    "*".repeat(
      Math.max(
        2,
        value.length - 4
      )
    ) +
    value.slice(-2)
  );
};

// --------------------------------------------------
// Tokenization
// --------------------------------------------------

const createToken = (
  value
) => {
  const hash =
    crypto
      .createHash("sha256")
      .update(
        `${process.env.TOKEN_SECRET || "privacy-firewall"}:${value}`
      )
      .digest("hex")
      .slice(0, 16)
      .toUpperCase();

  return `[TOKEN_${hash}]`;
};

// --------------------------------------------------
// Regex Escape
// --------------------------------------------------

const escapeRegex = (
  value
) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// --------------------------------------------------
// Protect Text
// --------------------------------------------------

const protectText = (
  text,
  detections = []
) => {
  if (
    typeof text !== "string"
  ) {
    throw new TypeError(
      "Text must be a string"
    );
  }

  if (
    !Array.isArray(
      detections
    )
  ) {
    throw new TypeError(
      "Detections must be an array"
    );
  }

  if (
    detections.length === 0
  ) {
    return {
      protectedText: text,
      detections: [],
      blocked: false,
      protected: false,
      decision: "ALLOW",
      llmAllowed: true,
    };
  }

  let protectedText = text;

  let blocked = false;

  let hasProtection = false;

  const processedDetections =
    detections.map(
      (detection) => {
        const requestedAction =
          typeof detection.action ===
          "string"
            ? detection.action
                .toLowerCase()
            : "redact";

        const rule =
          actionMap[
            requestedAction
          ] ||
          actionMap.redact;

        const replacement =
          getReplacement(
            detection.policyType ||
              detection.type,
            requestedAction,
            detection.value
          );

        let protectedValue =
          detection.value;

        if (
          requestedAction ===
          "allow"
        ) {
          protectedValue =
            detection.value;
        } else if (
          replacement
        ) {
          const regex =
            new RegExp(
              escapeRegex(
                detection.value
              ),
              "g"
            );

          protectedText =
            protectedText.replace(
              regex,
              replacement
            );

          protectedValue =
            replacement;
        }

        if (rule.blocked) {
          blocked = true;
        }

        if (rule.protected) {
          hasProtection = true;
        }

        return {
          ...detection,

          action:
            rule.action,

          protectedValue,
        };
      }
    );

  let decision = "ALLOW";

  let llmAllowed = true;

  if (blocked) {
    decision = "BLOCK";

    llmAllowed = false;
  } else if (
    hasProtection
  ) {
    decision = "PROTECT";

    llmAllowed = true;
  }

  return {
    protectedText,

    detections:
      processedDetections,

    blocked,

    protected:
      hasProtection,

    decision,

    llmAllowed,
  };
};

module.exports = {
  protectText,
  maskValue,
  createToken,
};