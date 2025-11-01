export enum Status {
  Passed = 'Passed',
  Failed = 'Failed',
  Running = 'Running',
  Queued = 'Queued',
}

export enum Platform {
  Windows = 'Windows',
  MacOS = 'macOS',
  Ubuntu = 'Ubuntu',
}

export enum Browser {
  Chrome = 'Chrome',
  Edge = 'Edge',
  Firefox = 'Firefox',
}

export interface TestRun {
  id: string;
  name: string;
  status: Status;
  platform: Platform;
  browser: Browser;
  duration: string;
  timestamp: string;
  commit: string;
  triggeredBy: string;
  executionMode: 'headless' | 'headful';
  videoUrl: string;
  screenshots: { name: string; url: string }[];
  logs: { level: 'info' | 'warn' | 'error'; message: string; timestamp: string }[];
}


// Types for AI-Generated Tests
export interface TestStep {
  action: 'navigate' | 'type' | 'click' | 'assertText' | 'press';
  url?: string;
  locator?: string;
  text?: string;
  key?: string;
  expected?: string;
}

export interface TestSpec {
  steps: TestStep[];
  browser: string;
  timeoutMs: number;
  autoWait: boolean;
}

export interface GeneratedTest {
    testName: string;
    humanReadableSteps: string[];
    testSpec: TestSpec;
}
