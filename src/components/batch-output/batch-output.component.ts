import styles from './batch-output.styles.scss';
import i18n from '../../i18n';
import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';

/**
 * Renderable output item produced by one batch statement.
 */
export interface BatchOutputItem {
  command: string;
  html: string;
  error?: boolean;
}

/**
 * Shadow DOM element map for the batch output component.
 */
export interface BatchOutputElementEntry {
  root: HTMLElement;
  placeholder: HTMLElement;
  list: HTMLOListElement;
}

export type BatchOutputElement = WebComponentElement<BatchOutputElementEntry>;
export const BatchOutputElementEntryKey: (keyof BatchOutputElementEntry)[] = ['root', 'placeholder', 'list'] as const;

/**
 * Output panel that displays evaluated statements and errors.
 */
export class BatchOutput extends HTMLElement {
  public static readonly tagName = 'batch-output';
  public readonly element = {} as BatchOutputElement;
  public static readonly elementFields: (keyof BatchOutputElementEntry)[] = BatchOutputElementEntryKey;
  public static readonly elementPostfix = keyToPostfix(BatchOutputElementEntryKey);
  public static readonly null = null as unknown as BatchOutput;
  public static readonly undefined = undefined as unknown as BatchOutput;

  public constructor() {
    super();
    constructorFactory(BatchOutput, styles).bind(this)();
    this.setLanguage();
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

  public setId: (this: BatchOutput, id?: string) => void = setIdFirstFactory(BatchOutput).bind(this);
  public static readonly createElement = createElementFactory(BatchOutput);
  public static readonly define = defineFactory(BatchOutput);

  public set container(element: HTMLElement) {
    setContainerFactory().bind(this)(element);
  }

  public get container(): HTMLElement {
    return this.element.container;
  }

  /**
   * Subscribe to language changes while the component is connected.
   */
  public connectedCallback(): void {
    i18n.addEventListener('languagechange', this.setLanguage);
  }

  /**
   * Remove language subscriptions.
   */
  public disconnectedCallback(): void {
    i18n.removeEventListener('languagechange', this.setLanguage);
  }

  /**
   * Whether the output panel currently contains rendered items.
   */
  public get hasItems(): boolean {
    return this.element.list.childElementCount > 0;
  }

  /**
   * Clear all output items and show the empty-state placeholder.
   */
  public clear(): void {
    this.element.list.replaceChildren();
    this.element.placeholder.hidden = false;
  }

  /**
   * Replace the rendered output items.
   *
   * @param items Batch output items to render.
   */
  public setItems(items: BatchOutputItem[]): void {
    this.element.list.replaceChildren(...items.map((item) => this.createItem(item)));
    this.element.placeholder.hidden = items.length > 0;
  }

  /**
   * Update the localized placeholder text.
   */
  private readonly setLanguage = (): void => {
    this.element.placeholder.textContent = i18n.page.output.placeholder;
  };

  /**
   * Create one output list entry.
   *
   * @param item Output item to render.
   * @returns List item element containing command text and result markup.
   */
  private createItem(item: BatchOutputItem): HTMLLIElement {
    const entry = document.createElement('li');
    const command = document.createElement('pre');
    const result = document.createElement('div');
    entry.className = 'entry';
    command.className = 'command';
    result.className = item.error ? 'result error' : 'result';
    command.textContent = item.command;
    result.innerHTML = item.html;
    entry.append(command, result);
    return entry;
  }
}

BatchOutput.define();
