import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { bitable } from "@lark-base-open/js-sdk";
import { Alert } from "antd";
import { useTranslation } from "react-i18next";
import { initI18n } from "./i18n";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LoadApp />
  </React.StrictMode>,
);

function LoadApp() {
  const [initial, setInitial] = useState(true);
  const [loadErr, setLoadErr] = useState<any>(<Loading />);

  useEffect(() => {
    const fn = async () => {
      // 5s 后显示加载失败
      const timer = setTimeout(() => {
        initI18n("en");
        setTimeout(() => {
          setLoadErr(<LoadErr />);
        }, 1000);
      }, 5000);

      // 初始化语言
      await bitable.bridge.getLanguage().then((lang) => {
        clearTimeout(timer);
        initI18n(lang as any);
        setInitial(false);
      });
    };
    fn();
  }, []);

  if (!initial) {
    return <App></App>;
  }

  return loadErr;
}

function Loading() {
  const { t } = useTranslation();
  return <Alert message={t("initializing")} type="info" />;
}
function LoadErr() {
  const { t } = useTranslation();
  return <div>{t("load_error")}</div>;
}
