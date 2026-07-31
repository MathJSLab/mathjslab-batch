import styles from './batch-output.styles.scss';
import i18n from '../../i18n';
import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';

export interface BatchOutputItem {
  command: string;
  html: string;
  error?: boolean;
}

export interface BatchOutputElementEntry {
  root: HTMLElement;
  placeholder: HTMLElement;
  list: HTMLOListElement;
}

export type BatchOutputElement = WebComponentElement<BatchOutputElementEntry>;
export const BatchOutputElementEntryKey: (keyof BatchOutputElementEntry)[] = ['root', 'placeholder', 'list'] as const;

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

  public connectedCallback(): void {
    i18n.addEventListener('languagechange', this.setLanguage);
  }

  public disconnectedCallback(): void {
    i18n.removeEventListener('languagechange', this.setLanguage);
  }

  public get hasItems(): boolean {
    return this.element.list.childElementCount > 0;
  }

  public clear(): void {
    this.element.list.replaceChildren();
    this.element.placeholder.hidden = false;
  }

  public setItems(items: BatchOutputItem[]): void {
    this.element.list.replaceChildren(...items.map((item) => this.createItem(item)));
    this.element.placeholder.hidden = items.length > 0;
  }

  private readonly setLanguage = (): void => {
    this.element.placeholder.textContent = i18n.page.output.placeholder;
  };

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
