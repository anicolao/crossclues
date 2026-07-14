import { type Page, type TestInfo, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface Verification { spec: string; check: () => Promise<void>; }
export interface StepOptions { description: string; verifications: Verification[]; }
interface DocStep { title: string; image: string; specs: string[]; }

export class TestStepHelper {
  private stepCount = 0;
  private steps: DocStep[] = [];
  private title = '';
  private description = '';
  constructor(private page: Page, private testInfo: TestInfo) {}

  setMetadata(title: string, description: string) {
    this.title = title;
    this.description = description;
  }

  async step(id: string, options: StepOptions) {
    for (const verification of options.verifications) await verification.check();
    const filename = `${String(this.stepCount++).padStart(3, '0')}-${id.replace(/_/g, '-')}`;
    await expect(this.page).toHaveScreenshot(filename);
    this.steps.push({ title: options.description, image: `./screenshots/${filename}.png`, specs: options.verifications.map(v => v.spec) });
  }

  generateDocs() {
    const content = this.steps.map(step => `## ${step.title}\n\n![${step.title}](${step.image})\n\n**Verifications:**\n\n${step.specs.map(spec => `- [x] ${spec}`).join('\n')}\n`).join('\n---\n\n');
    const heading = this.title || this.testInfo.title;
    const introduction = this.description ? `${this.description}\n\n` : '';
    fs.writeFileSync(path.join(path.dirname(this.testInfo.file), 'README.md'), `# ${heading}\n\n${introduction}${content}`);
  }
}
