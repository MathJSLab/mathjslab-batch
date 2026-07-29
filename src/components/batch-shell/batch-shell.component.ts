import { Interpreter, type NodeInput } from 'mathjslab';
import styles from './batch-shell.styles.scss';
import buildConfiguration from '../../build-configuration.json';
import type WebComponentElement from '../WebComponentElement';
import constructorFactory from '../constructorFactory';
import createElementFactory from '../createElementFactory';
import defineFactory from '../defineFactory';
import keyToPostfix from '../keyToPostfix';
import setContainerFactory from '../setContainerFactory';
import setIdFirstFactory from '../setIdFirstFactory';
import type { BatchCodeEditor } from '../batch-code-editor/batch-code-editor.component';
import type { BatchOutput, BatchOutputItem } from '../batch-output/batch-output.component';

export interface BatchShellElementEntry {
  root: HTMLElement;
  status: HTMLElement;
  editor: BatchCodeEditor;
  run: HTMLButtonElement;
  clearOutput: HTMLButtonElement;
  reset: HTMLButtonElement;
  output: BatchOutput;
}

export type BatchShellElement = WebComponentElement<BatchShellElementEntry>;
export const BatchShellElementEntryKey: (keyof BatchShellElementEntry)[] = ['root', 'status', 'editor', 'run', 'clearOutput', 'reset', 'output'] as const;

export class BatchShell extends HTMLElement {
  public static readonly tagName = 'batch-shell';
  public readonly element = {} as BatchShellElement;
  public static readonly elementFields: (keyof BatchShellElementEntry)[] = BatchShellElementEntryKey;
  public static readonly elementPostfix = keyToPostfix(BatchShellElementEntryKey);
  public static readonly null = null as unknown as BatchShell;
  public static readonly undefined = undefined as unknown as BatchShell;
  private readonly interpreter = Interpreter.Create({});

  public constructor() {
    super();
    constructorFactory(BatchShell, styles).bind(this)();
    this.interpreter.debug = buildConfiguration.debug;
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

  public setId: (this: BatchShell, id?: string) => void = setIdFirstFactory(BatchShell).bind(this);
  public static readonly createElement = createElementFactory(BatchShell);
  public static readonly define = defineFactory(BatchShell);

  public set container(element: HTMLElement) {
    setContainerFactory().bind(this)(element);
  }

  public get container(): HTMLElement {
    return this.element.container;
  }

  public connectedCallback(): void {
    this.element.run.addEventListener('click', this.run);
    this.element.clearOutput.addEventListener('click', this.clearOutput);
    this.element.reset.addEventListener('click', this.resetSample);
  }

  public disconnectedCallback(): void {
    this.element.run.removeEventListener('click', this.run);
    this.element.clearOutput.removeEventListener('click', this.clearOutput);
    this.element.reset.removeEventListener('click', this.resetSample);
  }

  private readonly run = (): void => {
    const source = this.element.editor.value;
    const items: BatchOutputItem[] = [];
    try {
      const parsed = this.parseStatements(source);
      for (const command of parsed.statements) {
        const tree = this.interpreter.Parse(command);
        const evaluated = this.interpreter.Evaluate(tree);
        items.push({
          command,
          html: this.formatResult(tree, evaluated),
        });
      }
      this.element.output.setItems(items);
      this.element.status.textContent = `Finished: ${items.length} statement${items.length === 1 ? '' : 's'}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      items.push({ command: source.trim(), html: this.escapeHTML(message), error: true });
      this.element.output.setItems(items);
      this.element.status.textContent = 'Stopped with error';
      if (this.interpreter.debug) {
        throw error;
      }
    }
  };

  private readonly clearOutput = (): void => {
    this.element.output.clear();
    this.element.status.textContent = 'Ready';
    this.element.editor.focus();
  };

  private readonly resetSample = (): void => {
    this.element.editor.value = ['A = [1 2; 3 4];', 'b = [5; 6];', 'x = A \\ b', 'sin(pi / 6)'].join('\n');
    this.clearOutput();
  };

  private parseStatements(input: string): { statements: string[]; lines: string[] } {
    const statements: string[] = [];
    const lines = input.split(/\r?\n/);
    const tree = this.interpreter.Parse(input);
    for (let i = 0; i < tree.list.length; i++) {
      const node = tree.list[i]!;
      if (node.stop.line === node.start.line) {
        if ((i === 0 || tree.list[i - 1]!.stop.line < node.start.line) && (i === tree.list.length - 1 || tree.list[i + 1]!.start.line > node.start.line)) {
          statements[i] = lines[node.start.line - 1] ?? '';
        } else {
          statements[i] = (lines[node.start.line - 1] ?? '').substring(node.start.column, node.stop.column + 1);
        }
      } else {
        statements[i] = this.getMultilineStatement(lines, tree.list, i).trim();
      }
    }
    return { statements: statements.filter((statement) => statement.trim().length > 0), lines };
  }

  private getMultilineStatement(lines: string[], list: NodeInput[], index: number): string {
    const node = list[index]!;
    let result = '';
    if (index === 0 || list[index - 1]!.stop.line < node.start.line) {
      result = `${lines[node.start.line - 1] ?? ''}\n`;
    } else {
      result = `${(lines[node.start.line - 1] ?? '').substring(node.start.column)}\n`;
    }
    if (node.stop.line > node.start.line + 1) {
      result += `${lines.slice(node.start.line, node.stop.line - 1).join('\n')}\n`;
    }
    if (index === list.length - 1 || list[index + 1]!.start.line > node.start.line) {
      result += lines[node.stop.line - 1] ?? '';
    } else {
      result += (lines[node.stop.line - 1] ?? '').substring(0, node.stop.column);
    }
    return result;
  }

  private formatResult(input: NodeInput, evaluated: NodeInput): string {
    const inputText = this.interpreter.Unparse(input);
    const resultText = this.interpreter.Unparse(evaluated);
    const inputMath = this.interpreter.UnparseMathML(input);
    const resultMath = this.interpreter.UnparseMathML(evaluated);
    if (inputText === resultText) {
      return `<table><tr><td>${inputMath}</td></tr></table>`;
    }
    return `<table><tr><td>${inputMath}</td><td><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mo>=</mo></math></td><td>${resultMath}</td></tr></table>`;
  }

  private escapeHTML(value: string): string {
    const text = document.createTextNode(value);
    const wrapper = document.createElement('div');
    wrapper.append(text);
    return wrapper.innerHTML;
  }
}

BatchShell.define();
