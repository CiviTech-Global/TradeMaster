import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../../infrastructure/i18n/format";

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation("translation", { keyPrefix: "legal" });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", lineHeight: "1.7" }}>
      <h1>{t("privacyPolicy.title")}</h1>
      <p>
        <strong>{t("effectiveDateLabel")}</strong>{" "}
        <span dir="ltr">{formatDate(new Date())}</span>
      </p>
      <p>{t("privacyPolicy.intro")}</p>
      <h2>{t("privacyPolicy.section1Title")}</h2>
      <p>{t("privacyPolicy.section1Text")}</p>
      <h2>{t("privacyPolicy.section2Title")}</h2>
      <p>{t("privacyPolicy.section2Text")}</p>
      <h2>{t("privacyPolicy.section3Title")}</h2>
      <p>{t("privacyPolicy.section3Text")}</p>
      <h2>{t("privacyPolicy.section4Title")}</h2>
      <p>{t("privacyPolicy.section4Text")}</p>
      <h2>{t("privacyPolicy.section5Title")}</h2>
      <p>{t("privacyPolicy.section5Text")}</p>
      <p style={{ marginTop: "2rem" }}>
        <Link to="/signup">
          <span className="icon-flip-rtl">&larr;</span> {t("backToSignUp")}
        </Link>
      </p>
    </div>
  );
};

export default PrivacyPolicy;
