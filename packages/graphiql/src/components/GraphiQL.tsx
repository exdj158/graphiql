/**
 *  Copyright (c) 2020 GraphQL Contributors.
 *
 *  This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import React, {
  ComponentType,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useReducer,
  useState,
} from 'react';

import {
  Button,
  ButtonGroup,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  Dialog,
  ExecuteButton,
  GraphiQLProvider,
  GraphiQLProviderProps,
  HeaderEditor,
  KeyboardShortcutIcon,
  MergeIcon,
  PlusIcon,
  PrettifyIcon,
  QueryEditor,
  ReloadIcon,
  ResponseEditor,
  SettingsIcon,
  Spinner,
  Tab,
  Tabs,
  ToolbarButton,
  Tooltip,
  UnStyledButton,
  useCopyQuery,
  useDragResize,
  useEditorContext,
  useExecutionContext,
  UseHeaderEditorArgs,
  useMergeQuery,
  usePluginContext,
  usePrettifyEditors,
  UseQueryEditorArgs,
  UseResponseEditorArgs,
  useSchemaContext,
  useStorageContext,
  useTheme,
  UseVariableEditorArgs,
  VariableEditor,
  WriteableEditorProps,
  Menu,
} from '@graphiql/react';
import i18n, { I18nResources, resources } from '../utils/i18n';

const { t } = i18n;
const majorVersion = parseInt(React.version.slice(0, 2), 10);

if (majorVersion < 16) {
  throw new Error(
    [
      'GraphiQL 0.18.0 and after is not compatible with React 15 or below.',
      'If you are using a CDN source (jsdelivr, unpkg, etc), follow this example:',
      'https://github.com/graphql/graphiql/blob/master/examples/graphiql-cdn/index.html#L49',
    ].join('\n'),
  );
}

export type GraphiQLToolbarConfig = {
  /**
   * This content will be rendered after the built-in buttons of the toolbar.
   * Note that this will not apply if you provide a completely custom toolbar
   * (by passing `GraphiQL.Toolbar` as child to the `GraphiQL` component).
   */
  additionalContent?: React.ReactNode;
};

/**
 * API docs for this live here:
 *
 * https://graphiql-test.netlify.app/typedoc/modules/graphiql.html#graphiqlprops
 */
export type GraphiQLProps = Omit<GraphiQLProviderProps, 'children'> &
  GraphiQLInterfaceProps & {
    /** set i18n language resource */
    i18nResources?: I18nResources;
  };

/**
 * The top-level React component for GraphiQL, intended to encompass the entire
 * browser viewport.
 *
 * @see https://github.com/graphql/graphiql#usage
 */

export function GraphiQL({
  dangerouslyAssumeSchemaIsValid,
  defaultQuery,
  defaultTabs,
  externalFragments,
  fetcher,
  getDefaultFieldNames,
  headers,
  initialTabs,
  inputValueDeprecation,
  introspectionQueryName,
  maxHistoryLength,
  onEditOperationName,
  onSchemaChange,
  onTabChange,
  onTogglePluginVisibility,
  operationName,
  plugins,
  query,
  response,
  schema,
  schemaDescription,
  shouldPersistHeaders,
  storage,
  validationRules,
  variables,
  visiblePlugin,
  defaultHeaders,
  i18nResources,
  ...props
}: GraphiQLProps) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    if (!i18nResources) {
      return;
    }

    try {
      for (const key of Object.keys(i18nResources)) {
        i18n.addResources(key, 'translations', i18nResources[key].translations);
      }
    } catch {}

    forceUpdate();
  }, [i18nResources]);

  // Ensure props are correct
  if (typeof fetcher !== 'function') {
    throw new TypeError(
      'The `GraphiQL` component requires a `fetcher` function to be passed as prop.',
    );
  }

  return (
    <GraphiQLProvider
      getDefaultFieldNames={getDefaultFieldNames}
      dangerouslyAssumeSchemaIsValid={dangerouslyAssumeSchemaIsValid}
      defaultQuery={defaultQuery}
      defaultHeaders={defaultHeaders}
      defaultTabs={defaultTabs}
      externalFragments={externalFragments}
      fetcher={fetcher}
      headers={headers}
      initialTabs={initialTabs}
      inputValueDeprecation={inputValueDeprecation}
      introspectionQueryName={introspectionQueryName}
      maxHistoryLength={maxHistoryLength}
      onEditOperationName={onEditOperationName}
      onSchemaChange={onSchemaChange}
      onTabChange={onTabChange}
      onTogglePluginVisibility={onTogglePluginVisibility}
      plugins={plugins}
      visiblePlugin={visiblePlugin}
      operationName={operationName}
      query={query}
      response={response}
      schema={schema}
      schemaDescription={schemaDescription}
      shouldPersistHeaders={
        localStorage.getItem('graphiql:shouldPersistHeaders') === 'true'
      }
      storage={storage}
      validationRules={validationRules}
      variables={variables}
    >
      <GraphiQLInterface
        showPersistHeadersSettings={shouldPersistHeaders !== false}
        {...props}
      />
    </GraphiQLProvider>
  );
}
// Export main windows/panes to be used separately if desired.
GraphiQL.Logo = GraphiQLLogo;
GraphiQL.Toolbar = GraphiQLToolbar;
GraphiQL.Footer = GraphiQLFooter;

type AddSuffix<Obj extends Record<string, any>, Suffix extends string> = {
  [Key in keyof Obj as `${string & Key}${Suffix}`]: Obj[Key];
};

export type GraphiQLInterfaceProps = WriteableEditorProps &
  AddSuffix<Pick<UseQueryEditorArgs, 'onEdit'>, 'Query'> &
  Pick<UseQueryEditorArgs, 'onCopyQuery'> &
  AddSuffix<Pick<UseVariableEditorArgs, 'onEdit'>, 'Variables'> &
  AddSuffix<Pick<UseHeaderEditorArgs, 'onEdit'>, 'Headers'> &
  Pick<UseResponseEditorArgs, 'responseTooltip'> & {
    children?: ReactNode;
    /**
     * Set the default state for the editor tools.
     * - `false` hides the editor tools
     * - `true` shows the editor tools
     * - `'variables'` specifically shows the variables editor
     * - `'headers'` specifically shows the headers editor
     * By default the editor tools are initially shown when at least one of the
     * editors has contents.
     */
    defaultEditorToolsVisibility?: boolean | 'variables' | 'headers';
    /**
     * Toggle if the headers editor should be shown inside the editor tools.
     * @default true
     */
    isHeadersEditorEnabled?: boolean;
    /**
     * An object that allows configuration of the toolbar next to the query
     * editor.
     */
    toolbar?: GraphiQLToolbarConfig;
    /**
     * Indicates if settings for persisting headers should appear in the
     * settings modal.
     */
    showPersistHeadersSettings?: boolean;
  };

export function GraphiQLInterface(props: GraphiQLInterfaceProps) {
  const isHeadersEditorEnabled = props.isHeadersEditorEnabled ?? true;

  const editorContext = useEditorContext({ nonNull: true });
  const executionContext = useExecutionContext({ nonNull: true });
  const schemaContext = useSchemaContext({ nonNull: true });
  const storageContext = useStorageContext();
  const pluginContext = usePluginContext();

  const copy = useCopyQuery({ onCopyQuery: props.onCopyQuery });
  const merge = useMergeQuery();
  const prettify = usePrettifyEditors();

  const { theme, setTheme } = useTheme();

  const PluginContent = pluginContext?.visiblePlugin?.content;

  const pluginResize = useDragResize({
    defaultSizeRelation: 1 / 3,
    direction: 'horizontal',
    initiallyHidden: pluginContext?.visiblePlugin ? undefined : 'first',
    onHiddenElementChange: resizableElement => {
      if (resizableElement === 'first') {
        pluginContext?.setVisiblePlugin(null);
      }
    },
    sizeThresholdSecond: 200,
    storageKey: 'docExplorerFlex',
  });
  const editorResize = useDragResize({
    direction: 'horizontal',
    storageKey: 'editorFlex',
  });
  const editorToolsResize = useDragResize({
    defaultSizeRelation: 3,
    direction: 'vertical',
    initiallyHidden: (() => {
      if (
        props.defaultEditorToolsVisibility === 'variables' ||
        props.defaultEditorToolsVisibility === 'headers'
      ) {
        return;
      }

      if (typeof props.defaultEditorToolsVisibility === 'boolean') {
        return props.defaultEditorToolsVisibility ? undefined : 'second';
      }

      return editorContext.initialVariables || editorContext.initialHeaders
        ? undefined
        : 'second';
    })(),
    sizeThresholdSecond: 60,
    storageKey: 'secondaryEditorFlex',
  });

  const [activeSecondaryEditor, setActiveSecondaryEditor] = useState<
    'variables' | 'headers'
  >(() => {
    if (
      props.defaultEditorToolsVisibility === 'variables' ||
      props.defaultEditorToolsVisibility === 'headers'
    ) {
      return props.defaultEditorToolsVisibility;
    }
    return !editorContext.initialVariables &&
      editorContext.initialHeaders &&
      isHeadersEditorEnabled
      ? 'headers'
      : 'variables';
  });
  const [showDialog, setShowDialog] = useState<
    'settings' | 'short-keys' | null
  >(null);
  const [clearStorageStatus, setClearStorageStatus] = useState<
    'success' | 'error' | null
  >(null);

  const children = React.Children.toArray(props.children);

  const logo = children.find(child =>
    isChildComponentType(child, GraphiQL.Logo),
  ) || <GraphiQL.Logo />;

  const toolbar = children.find(child =>
    isChildComponentType(child, GraphiQL.Toolbar),
  ) || (
    <>
      <ToolbarButton
        onClick={() => prettify()}
        label={t('Prettify query (Shift-Ctrl-P)')}
      >
        <PrettifyIcon className="graphiql-toolbar-icon" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => merge()}
        label={t('Merge fragments into query (Shift-Ctrl-M)')}
      >
        <MergeIcon className="graphiql-toolbar-icon" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => copy()}
        label={t('Copy query (Shift-Ctrl-C)')}
      >
        <CopyIcon className="graphiql-toolbar-icon" aria-hidden="true" />
      </ToolbarButton>
      {props.toolbar?.additionalContent || null}
    </>
  );

  const footer = children.find(child =>
    isChildComponentType(child, GraphiQL.Footer),
  );

  const onClickReference = () => {
    if (pluginResize.hiddenElement === 'first') {
      pluginResize.setHiddenElement(null);
    }
  };

  const modifier =
    window.navigator.platform.toLowerCase().indexOf('mac') === 0 ? (
      <code className="graphiql-key">Cmd</code>
    ) : (
      <code className="graphiql-key">Ctrl</code>
    );

  return (
    <div data-testid="graphiql-container" className="graphiql-container">
      <div className="graphiql-sidebar">
        <div className="graphiql-sidebar-section">
          {pluginContext?.plugins.map(plugin => {
            const isVisible = plugin === pluginContext.visiblePlugin;
            const label = `${isVisible ? t('Hide') : t('Show')} ${t(
              plugin.title,
            )}`;
            const Icon = plugin.icon;
            return (
              <Tooltip key={t(plugin.title)} label={label}>
                <UnStyledButton
                  type="button"
                  className={isVisible ? 'active' : ''}
                  onClick={() => {
                    if (isVisible) {
                      pluginContext.setVisiblePlugin(null);
                      pluginResize.setHiddenElement('first');
                    } else {
                      pluginContext.setVisiblePlugin(plugin);
                      pluginResize.setHiddenElement(null);
                    }
                  }}
                  aria-label={label}
                >
                  <Icon aria-hidden="true" />
                </UnStyledButton>
              </Tooltip>
            );
          })}
        </div>
        <div className="graphiql-sidebar-section">
          <Tooltip label={t('Re-fetch GraphQL schema')}>
            <UnStyledButton
              type="button"
              disabled={schemaContext.isFetching}
              onClick={() => schemaContext.introspect()}
              aria-label={t('Re-fetch GraphQL schema') || ''}
            >
              <ReloadIcon
                className={schemaContext.isFetching ? 'graphiql-spin' : ''}
                aria-hidden="true"
              />
            </UnStyledButton>
          </Tooltip>
          <Tooltip label={t('Open short keys dialog')}>
            <UnStyledButton
              type="button"
              onClick={() => setShowDialog('short-keys')}
              aria-label={t('Open short keys dialog') || ''}
            >
              <KeyboardShortcutIcon aria-hidden="true" />
            </UnStyledButton>
          </Tooltip>
          <Tooltip label={t('Open settings dialog')}>
            <UnStyledButton
              type="button"
              onClick={() => setShowDialog('settings')}
              aria-label={t('Open settings dialog') || ''}
            >
              <SettingsIcon aria-hidden="true" />
            </UnStyledButton>
          </Tooltip>
        </div>
      </div>
      <div className="graphiql-main">
        <div
          ref={pluginResize.firstRef}
          style={{
            // Make sure the container shrinks when containing long
            // non-breaking texts
            minWidth: '200px',
          }}
        >
          <div className="graphiql-plugin">
            {PluginContent ? <PluginContent /> : null}
          </div>
        </div>
        <div ref={pluginResize.dragBarRef}>
          {pluginContext?.visiblePlugin ? (
            <div className="graphiql-horizontal-drag-bar" />
          ) : null}
        </div>
        <div ref={pluginResize.secondRef} style={{ minWidth: 0 }}>
          <div className="graphiql-sessions">
            <div className="graphiql-session-header">
              <Tabs aria-label="Select active operation">
                {editorContext.tabs.length > 1 ? (
                  <>
                    {editorContext.tabs.map((tab, index) => (
                      <Tab
                        key={tab.id}
                        isActive={index === editorContext.activeTabIndex}
                      >
                        <Tab.Button
                          aria-controls="graphiql-session"
                          id={`graphiql-session-tab-${index}`}
                          onClick={() => {
                            executionContext.stop();
                            editorContext.changeTab(index);
                          }}
                        >
                          {tab.title}
                        </Tab.Button>
                        <Tab.Close
                          onClick={() => {
                            if (editorContext.activeTabIndex === index) {
                              executionContext.stop();
                            }
                            editorContext.closeTab(index);
                          }}
                        />
                      </Tab>
                    ))}
                    <div>
                      <Tooltip label={t('Add tab')}>
                        <UnStyledButton
                          type="button"
                          className="graphiql-tab-add"
                          onClick={() => editorContext.addTab()}
                          aria-label="Add tab"
                        >
                          <PlusIcon aria-hidden="true" />
                        </UnStyledButton>
                      </Tooltip>
                    </div>
                  </>
                ) : null}
              </Tabs>
              <div className="graphiql-session-header-right">
                {editorContext.tabs.length === 1 ? (
                  <div className="graphiql-add-tab-wrapper">
                    <Tooltip label={t('Add tab')}>
                      <UnStyledButton
                        type="button"
                        className="graphiql-tab-add"
                        onClick={() => editorContext.addTab()}
                        aria-label="Add tab"
                      >
                        <PlusIcon aria-hidden="true" />
                      </UnStyledButton>
                    </Tooltip>
                  </div>
                ) : null}
                {logo}
              </div>
            </div>
            <div
              role="tabpanel"
              id="graphiql-session"
              className="graphiql-session"
              aria-labelledby={`graphiql-session-tab-${editorContext.activeTabIndex}`}
            >
              <div ref={editorResize.firstRef}>
                <div
                  className={`graphiql-editors${
                    editorContext.tabs.length === 1 ? ' full-height' : ''
                  }`}
                >
                  <div ref={editorToolsResize.firstRef}>
                    <section
                      className="graphiql-query-editor"
                      aria-label="Query Editor"
                    >
                      <div className="graphiql-query-editor-wrapper">
                        <QueryEditor
                          editorTheme={props.editorTheme}
                          keyMap={props.keyMap}
                          onClickReference={onClickReference}
                          onCopyQuery={props.onCopyQuery}
                          onEdit={props.onEditQuery}
                          readOnly={props.readOnly}
                        />
                      </div>
                      <div
                        className="graphiql-toolbar"
                        role="toolbar"
                        aria-label="Editor Commands"
                      >
                        <ExecuteButton />
                        {toolbar}
                      </div>
                    </section>
                  </div>
                  <div ref={editorToolsResize.dragBarRef}>
                    <div className="graphiql-editor-tools">
                      <div className="graphiql-editor-tools-tabs">
                        <UnStyledButton
                          type="button"
                          className={
                            activeSecondaryEditor === 'variables' &&
                            editorToolsResize.hiddenElement !== 'second'
                              ? 'active'
                              : ''
                          }
                          onClick={() => {
                            if (editorToolsResize.hiddenElement === 'second') {
                              editorToolsResize.setHiddenElement(null);
                            }
                            setActiveSecondaryEditor('variables');
                          }}
                        >
                          {t('Variables')}
                        </UnStyledButton>
                        {isHeadersEditorEnabled ? (
                          <UnStyledButton
                            type="button"
                            className={
                              activeSecondaryEditor === 'headers' &&
                              editorToolsResize.hiddenElement !== 'second'
                                ? 'active'
                                : ''
                            }
                            onClick={() => {
                              if (
                                editorToolsResize.hiddenElement === 'second'
                              ) {
                                editorToolsResize.setHiddenElement(null);
                              }
                              setActiveSecondaryEditor('headers');
                            }}
                          >
                            {t('Headers')}
                          </UnStyledButton>
                        ) : null}
                      </div>
                      <Tooltip
                        label={
                          editorToolsResize.hiddenElement === 'second'
                            ? t('Show editor tools')
                            : t('Hide editor tools')
                        }
                      >
                        <UnStyledButton
                          type="button"
                          onClick={() => {
                            editorToolsResize.setHiddenElement(
                              editorToolsResize.hiddenElement === 'second'
                                ? null
                                : 'second',
                            );
                          }}
                          aria-label={
                            editorToolsResize.hiddenElement === 'second'
                              ? t('Show editor tools') || ''
                              : t('Hide editor tools') || ''
                          }
                        >
                          {editorToolsResize.hiddenElement === 'second' ? (
                            <ChevronUpIcon
                              className="graphiql-chevron-icon"
                              aria-hidden="true"
                            />
                          ) : (
                            <ChevronDownIcon
                              className="graphiql-chevron-icon"
                              aria-hidden="true"
                            />
                          )}
                        </UnStyledButton>
                      </Tooltip>
                    </div>
                  </div>
                  <div ref={editorToolsResize.secondRef}>
                    <section
                      className="graphiql-editor-tool"
                      aria-label={
                        activeSecondaryEditor === 'variables'
                          ? 'Variables'
                          : 'Headers'
                      }
                    >
                      <VariableEditor
                        editorTheme={props.editorTheme}
                        isHidden={activeSecondaryEditor !== 'variables'}
                        keyMap={props.keyMap}
                        onEdit={props.onEditVariables}
                        onClickReference={onClickReference}
                        readOnly={props.readOnly}
                      />
                      {isHeadersEditorEnabled && (
                        <HeaderEditor
                          editorTheme={props.editorTheme}
                          isHidden={activeSecondaryEditor !== 'headers'}
                          keyMap={props.keyMap}
                          onEdit={props.onEditHeaders}
                          readOnly={props.readOnly}
                        />
                      )}
                    </section>
                  </div>
                </div>
              </div>
              <div ref={editorResize.dragBarRef}>
                <div className="graphiql-horizontal-drag-bar" />
              </div>
              <div ref={editorResize.secondRef}>
                <div className="graphiql-response">
                  {executionContext.isFetching ? <Spinner /> : null}
                  <ResponseEditor
                    editorTheme={props.editorTheme}
                    responseTooltip={props.responseTooltip}
                    keyMap={props.keyMap}
                  />
                  {footer}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        isOpen={showDialog === 'short-keys'}
        onDismiss={() => setShowDialog(null)}
      >
        <div className="graphiql-dialog-header">
          <div className="graphiql-dialog-title">{t('Short Keys')}</div>
          <Dialog.Close onClick={() => setShowDialog(null)} />
        </div>
        <div className="graphiql-dialog-section">
          <div>
            <table className="graphiql-table">
              <thead>
                <tr>
                  <th>{t('Short Key')}</th>
                  <th>{t('Function')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {modifier}
                    {' + '}
                    <code className="graphiql-key">F</code>
                  </td>
                  <td>{t('Search in editor')}</td>
                </tr>
                <tr>
                  <td>
                    {modifier}
                    {' + '}
                    <code className="graphiql-key">K</code>
                  </td>
                  <td>{t('Search in documentation')}</td>
                </tr>
                <tr>
                  <td>
                    {modifier}
                    {' + '}
                    <code className="graphiql-key">Enter</code>
                  </td>
                  <td>{t('Execute query')}</td>
                </tr>
                <tr>
                  <td>
                    <code className="graphiql-key">Ctrl</code>
                    {' + '}
                    <code className="graphiql-key">Shift</code>
                    {' + '}
                    <code className="graphiql-key">P</code>
                  </td>
                  <td>{t('Prettify editors')}</td>
                </tr>
                <tr>
                  <td>
                    <code className="graphiql-key">Ctrl</code>
                    {' + '}
                    <code className="graphiql-key">Shift</code>
                    {' + '}
                    <code className="graphiql-key">M</code>
                  </td>
                  <td>
                    {t('Merge fragments definitions into operation definition')}
                  </td>
                </tr>
                <tr>
                  <td>
                    <code className="graphiql-key">Ctrl</code>
                    {' + '}
                    <code className="graphiql-key">Shift</code>
                    {' + '}
                    <code className="graphiql-key">C</code>
                  </td>
                  <td>{t('Copy query')}</td>
                </tr>
                <tr>
                  <td>
                    <code className="graphiql-key">Ctrl</code>
                    {' + '}
                    <code className="graphiql-key">Shift</code>
                    {' + '}
                    <code className="graphiql-key">R</code>
                  </td>
                  <td>{t('Re-fetch schema using introspection')}</td>
                </tr>
              </tbody>
            </table>
            <p>
              The editors use{' '}
              <a
                href="https://codemirror.net/5/doc/manual.html#keymaps"
                target="_blank"
                rel="noopener noreferrer"
              >
                CodeMirror Key Maps
              </a>{' '}
              that add more short keys. This instance of Graph<em>i</em>QL uses{' '}
              <code>{props.keyMap || 'sublime'}</code>.
            </p>
          </div>
        </div>
      </Dialog>
      <Dialog
        isOpen={showDialog === 'settings'}
        onDismiss={() => {
          setShowDialog(null);
          setClearStorageStatus(null);
        }}
      >
        <div className="graphiql-dialog-header">
          <div className="graphiql-dialog-title">{t('Settings')}</div>
          <Dialog.Close
            onClick={() => {
              setShowDialog(null);
              setClearStorageStatus(null);
            }}
          />
        </div>
        {props.showPersistHeadersSettings ? (
          <div className="graphiql-dialog-section">
            <div>
              <div className="graphiql-dialog-section-title">
                {t('Persist headers')}
              </div>
              <div className="graphiql-dialog-section-caption">
                {t('Save headers upon reloading.')}{' '}
                <span className="graphiql-warning-text">
                  {t('Only enable if you trust this device.')}
                </span>
              </div>
            </div>
            <ButtonGroup>
              <Button
                type="button"
                id="enable-persist-headers"
                className={
                  editorContext.shouldPersistHeaders ? 'active' : undefined
                }
                onClick={() => {
                  editorContext.setShouldPersistHeaders(true);
                }}
              >
                {t('On')}
              </Button>
              <Button
                type="button"
                id="disable-persist-headers"
                className={
                  editorContext.shouldPersistHeaders ? undefined : 'active'
                }
                onClick={() => {
                  editorContext.setShouldPersistHeaders(false);
                }}
              >
                {t('Off')}
              </Button>
            </ButtonGroup>
          </div>
        ) : null}
        <div className="graphiql-dialog-section">
          <div>
            <div className="graphiql-dialog-section-title">{t('Theme')}</div>
            <div className="graphiql-dialog-section-caption">
              {t('Adjust how the interface looks like.')}
            </div>
          </div>
          <div>
            <ButtonGroup>
              <Button
                type="button"
                className={theme === null ? 'active' : ''}
                onClick={() => setTheme(null)}
              >
                {t('System')}
              </Button>
              <Button
                type="button"
                className={theme === 'light' ? 'active' : ''}
                onClick={() => setTheme('light')}
              >
                {t('Light')}
              </Button>
              <Button
                type="button"
                className={theme === 'dark' ? 'active' : ''}
                onClick={() => setTheme('dark')}
              >
                {t('Dark')}
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <div className="graphiql-dialog-section">
          <div>
            <div className="graphiql-dialog-section-title">Languages</div>
            <div className="graphiql-dialog-section-caption">
              {t('Switch display language (page will refresh)')}
            </div>
          </div>
          <div>
            <Menu>
              <Menu.Button style={{ padding: '4px 10px' }}>
                {t('languageName')}
                <span aria-hidden>▾</span>
              </Menu.Button>
              <Menu.List portal={false}>
                {Object.keys(resources).map(key => (
                  <Menu.Item
                    key={key}
                    onSelect={async () => {
                      await i18n.changeLanguage(key);
                      window.location.reload();
                    }}
                    style={{ minWidth: 80 }}
                  >
                    {resources[key].translations.languageName}
                  </Menu.Item>
                ))}
              </Menu.List>
            </Menu>
          </div>
        </div>
        {storageContext ? (
          <div className="graphiql-dialog-section">
            <div>
              <div className="graphiql-dialog-section-title">
                {t('Clear storage')}
              </div>
              <div className="graphiql-dialog-section-caption">
                {t('Remove all locally stored data and start fresh.')}
              </div>
            </div>
            <div>
              <Button
                type="button"
                state={clearStorageStatus || undefined}
                disabled={clearStorageStatus === 'success'}
                onClick={() => {
                  try {
                    storageContext?.clear();
                    setClearStorageStatus('success');
                  } catch {
                    setClearStorageStatus('error');
                  }
                }}
              >
                {clearStorageStatus === 'success'
                  ? t('Cleared data')
                  : clearStorageStatus === 'error'
                  ? t('Failed')
                  : t('Clear data')}
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}

// Configure the UI by providing this Component as a child of GraphiQL.
function GraphiQLLogo<TProps>(props: PropsWithChildren<TProps>) {
  return (
    <div className="graphiql-logo">
      {props.children || (
        <a
          className="graphiql-logo-link"
          href="https://github.com/graphql/graphiql"
          target="_blank"
          rel="noreferrer"
        >
          Graph
          <em>i</em>
          QL
        </a>
      )}
    </div>
  );
}

GraphiQLLogo.displayName = 'GraphiQLLogo';

// Configure the UI by providing this Component as a child of GraphiQL.
function GraphiQLToolbar<TProps>(props: PropsWithChildren<TProps>) {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{props.children}</>;
}

GraphiQLToolbar.displayName = 'GraphiQLToolbar';

// Configure the UI by providing this Component as a child of GraphiQL.
function GraphiQLFooter<TProps>(props: PropsWithChildren<TProps>) {
  return <div className="graphiql-footer">{props.children}</div>;
}

GraphiQLFooter.displayName = 'GraphiQLFooter';

// Determines if the React child is of the same type of the provided React component
function isChildComponentType<T extends ComponentType>(
  child: any,
  component: T,
): child is T {
  if (
    child?.type?.displayName &&
    child.type.displayName === component.displayName
  ) {
    return true;
  }

  return child.type === component;
}
