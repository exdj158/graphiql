import i18n from 'i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';
import resources from '../translations';

// eslint-disable-next-line import/no-named-as-default-member
void i18n
    // 检测用户当前使用的语言
    // 文档: https://github.com/i18next/i18next-browser-languageDetector
    // .use(LanguageDetector)
    // 初始化 i18next
    // 配置参数的文档: https://www.i18next.com/overview/configuration-options
    .init({
        debug: false,
        fallbackLng: 'zh',
        interpolation: {
            escapeValue: false,
        },
        defaultNS: "trasnlations",
        ns: "trasnlations",
        resources,
    });

export default i18n;