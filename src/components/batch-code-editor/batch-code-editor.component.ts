import hljs from 'highlight.js/lib/core';
import matlab from 'highlight.js/lib/languages/matlab';
import styles from './batch-code-editor.styles.scss';
import i18n from '../../i18n';
import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';

hljs.registerLanguage('matlab', matlab);

export interface BatchCodeEditorElementEntry {
  root: HTMLElement;
  gutter: HTMLElement;
  stack: HTMLElement;
  highlight: HTMLElement;
  input: HTMLTextAreaElement;
}

export type BatchCodeEditorElement = WebComponentElement<BatchCodeEditorElementEntry>;
export const BatchCodeEditorElementEntryKey: (keyof BatchCodeEditorElementEntry)[] = ['root', 'gutter', 'stack', 'highlight', 'input'] as const;

export class BatchCodeEditor extends HTMLElement {
  public static readonly tagName = 'batch-code-editor';
  public readonly element = {} as BatchCodeEditorElement;
  public static readonly elementFields: (keyof BatchCodeEditorElementEntry)[] = BatchCodeEditorElementEntryKey;
  public static readonly elementPostfix = keyToPostfix(BatchCodeEditorElementEntryKey);
  public static readonly null = null as unknown as BatchCodeEditor;
  public static readonly undefined = undefined as unknown as BatchCodeEditor;

  public constructor() {
    super();
    constructorFactory(BatchCodeEditor, styles).bind(this)();
    this.value = ['A = [1 2; 3 4];', 'b = [5; 6];', 'x = A \\ b', 'sin(pi / 6)'].join('\n');
  }

  public set superId(id: string) {
    super.id = id;
  }

  public get superId(): string {
    return super.id;
  }

  public set id(id: string) {
    this.setId(id);
  }

  public get id(): string {
    return super.id;
  }

  public setId: (this: BatchCodeEditor, id?: string) => void = setIdFirstFactory(BatchCodeEditor).bind(this);
  public static readonly createElement = createElementFactory(BatchCodeEditor);
  public static readonly define = defineFactory(BatchCodeEditor);

  public set container(element: HTMLElement) {
    setContainerFactory().bind(this)(element);
  }

  public get container(): HTMLElement {
    return this.element.container;
  }

  public connectedCallback(): void {
    i18n.addEventListener('languagechange', this.setLanguage);
    this.element.input.addEventListener('input', this.input);
    this.element.input.addEventListener('scroll', this.syncScroll);
    this.setLanguage();
    this.render();
  }

  public disconnectedCallback(): void {
    i18n.removeEventListener('languagechange', this.setLanguage);
    this.element.input.removeEventListener('input', this.input);
    this.element.input.removeEventListener('scroll', this.syncScroll);
  }

  public get value(): string {
    return this.element.input.value;
  }

  public set value(value: string) {
    this.element.input.value = value;
    this.render();
  }

  public focus(): void {
    this.element.input.focus();
  }

  private readonly input = (): void => {
    this.render();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };

  private readonly setLanguage = (): void => {
    this.element.input.setAttribute('aria-label', i18n.page.editor.ariaLabel);
  };

  private readonly syncScroll = (): void => {
    this.element.highlight.style.transform = `translate(${-this.element.input.scrollLeft}px, ${-this.element.input.scrollTop}px)`;
    this.element.gutter.style.transform = `translateY(${-this.element.input.scrollTop}px)`;
  };

  private render(): void {
    const code = this.value;
    const highlighted = hljs.highlight(code || ' ', { language: 'matlab', ignoreIllegals: true }).value;
    const lineCount = Math.max(1, code.split(/\r\n|\r|\n/).length);
    this.element.highlight.innerHTML = highlighted.endsWith('\n') ? `${highlighted} ` : highlighted;
    this.element.gutter.textContent = Array.from({ length: lineCount }, (_value, index) => String(index + 1)).join('\n');
    this.element.root.dataset.empty = String(code.length === 0);
    this.syncScroll();
  }
}

BatchCodeEditor.define();
