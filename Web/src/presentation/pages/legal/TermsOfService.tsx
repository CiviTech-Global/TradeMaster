import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../../infrastructure/i18n/format";

const TermsOfService: React.FC = () => {
  const { t } = useTranslation("translation", { keyPrefix: "legal" });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", lineHeight: "1.7" }}>
      <h1>{t("termsOfService.title")}</h1>
      <p>
        <strong>{t("effectiveDateLabel")}</strong>{" "}
        <span dir="ltr">{formatDate(new Date())}</span>
      </p>
      <p>{t("termsOfService.intro")}</p>
      <h2>{t("termsOfService.section1Title")}</h2>
      <p>{t("termsOfService.section1Text")}</p>
      <h2>{t("termsOfService.section2Title")}</h2>
      <p>{t("termsOfService.section2Text")}</p>
      <h2>{t("termsOfService.section3Title")}</h2>
      <p>{t("termsOfService.section3Text")}</p>
      <h2>{t("termsOfService.section4Title")}</h2>
      <p>{t("termsOfService.section4Text")}</p>
      <h2>{t("termsOfService.section5Title")}</h2>
      <p>{t("termsOfService.section5Text")}</p>
      <p style={{ marginTop: "2rem" }}>
        <Link to="/signup">
          <span className="icon-flip-rtl">&larr;</span> {t("backToSignUp")}
        </Link>
      </p>
    </div>
  );
};

export default TermsOfService;
