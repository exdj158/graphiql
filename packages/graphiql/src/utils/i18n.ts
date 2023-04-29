import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

type DefaultNamespace = {
    [key in (keyof typeof zhCNTranslations)]?: string;
} & {
    languageName: string;
    [key: string]: string;
};

interface LanguageResource {
    translations: DefaultNamespace;
    [key: string]: Record<string, string>;
}

const zhCNTranslations = {
    'languageName': "简体中文",
    "Prettify query (Shift-Ctrl-P)": "美化 query (Shift-Ctrl-P)",
    "Merge fragments into query (Shift-Ctrl-M)": "合并 fragments 到 query 内 (Shift-Ctrl-M)",
    "Copy query (Shift-Ctrl-C)": "复制 query (Shift-Ctrl-C)",
    "Re-fetch GraphQL schema": "刷新 GraphQL schema",
    "Open short keys dialog": "打开快捷键帮助弹框",
    "Open settings dialog": "打开设置弹框",
    "Add tab": "新增tab",
    "Variables": "变量",
    "Headers": "请求头",
    'Show editor tools': "显示编辑器工具",
    'Hide editor tools': "隐藏编辑器工具",
    "Short Keys": "快捷键帮助",
    "Short Key": "快捷键",
    "Function": "功能",
    "Search in editor": "编辑器内搜索",
    "Search in documentation": "文档内搜索",
    "Execute query": "执行查询",
    "Prettify editors": "美化编辑器内容",
    "Merge fragments definitions into operation definition": "合并fragments definitions到operation definition",
    "Copy query": "复制 query",
    "Re-fetch schema using introspection": "使用introspection刷新schema ",
    "Settings": "设置",
    "Persist headers": "保存请求头到本地",
    "Save headers upon reloading.": "在刷新页面时也会保存请求头，",
    "Only enable if you trust this device.": "只有当你信任这个设备时才可以启用",
    "On": "开",
    "Off": "关",
    "Adjust how the interface looks like.": "调整界面显示",
    "Theme": "主题",
    "System": "系统",
    "Light": "明亮",
    "Dark": "暗黑",
    "Clear storage": "清除缓存",
    "Remove all locally stored data and start fresh.": "删除所有本地存储的数据并重置。",
    "Cleared data": "已清除数据",
    "Clear data": "清除数据",
    "Failed": "失败",
    'Show': "显示",
    'Hide': "隐藏",
    'Documentation Explorer': "文档管理器",
    'GraphiQL Explorer': "GraphiQL管理器",
    'History': "历史",
    'Languages': "语言",
    'Switch display language (page will refresh)': "切换显示语言(将会刷新页面)",
}

export type I18nResources = Record<string, LanguageResource>

export const resources: I18nResources = {
    "en-US": {
        translations: {
            "languageName": "English"
        }
    },
    "zh-CN": {
        translations: zhCNTranslations
    }
}

void i18n
    .use(LanguageDetector)
    .init({
        debug: false,
        fallbackLng: 'en-US',
        interpolation: {
            escapeValue: false,
        },
        defaultNS: "translations",
        ns: "translations",
        resources,
    });

export default i18n;