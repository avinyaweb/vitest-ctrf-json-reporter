import {
  Task,
  TaskState,
  type Awaitable,
  type File,
  type Reporter,
  type Vitest,
} from "vitest";
import {
  type CtrfReport,
  type CtrfTestState,
  type CtrfEnvironment,
  type CtrfTest,
} from "../types/ctrf";
import * as fs from "fs";
import * as path from "path";

interface ReporterConfigOptions {
  outputFile?: string;
  outputDir?: string;
  minimal?: boolean;
  testType?: string;
  appName?: string | undefined;
  appVersion?: string | undefined;
  osPlatform?: string | undefined;
  osRelease?: string | undefined;
  osVersion?: string | undefined;
  buildName?: string | undefined;
  buildNumber?: string | undefined;
  buildUrl?: string | undefined;
  repositoryName?: string | undefined;
  repositoryUrl?: string | undefined;
  branchName?: string | undefined;
  testEnvironment?: string | undefined;
}

class GenerateCtrfReport implements Reporter {
  readonly ctrfReport: CtrfReport;
  readonly ctrfEnvironment: CtrfEnvironment;
  readonly reporterConfigOptions: ReporterConfigOptions;
  readonly reporterName = "vitest-ctrf-json-reporter";
  readonly defaultOutputFile = "report.json";
  readonly defaultOutputDir = "vitest-ctrf";

  filename = this.defaultOutputFile;

  constructor(config?: Partial<ReporterConfigOptions>) {
    this.reporterConfigOptions = {
      outputFile: config?.outputFile ?? this.defaultOutputFile,
      outputDir: config?.outputDir ?? this.defaultOutputDir,
      minimal: config?.minimal ?? false,
      testType: config?.testType ?? "unit",
      appName: config?.appName ?? undefined,
      appVersion: config?.appVersion ?? undefined,
      osPlatform: config?.osPlatform ?? undefined,
      osRelease: config?.osRelease ?? undefined,
      osVersion: config?.osVersion ?? undefined,
      buildName: config?.buildName ?? undefined,
      buildNumber: config?.buildNumber ?? undefined,
      buildUrl: config?.buildUrl ?? undefined,
      repositoryName: config?.repositoryName ?? undefined,
      repositoryUrl: config?.repositoryUrl ?? undefined,
      branchName: config?.branchName ?? undefined,
      testEnvironment: config?.testEnvironment ?? undefined,
    };

    this.ctrfReport = {
      results: {
        tool: {
          name: "vitest",
        },
        summary: {
          tests: 0,
          passed: 0,
          failed: 0,
          pending: 0,
          skipped: 0,
          other: 0,
          start: 0,
          stop: 0,
        },
        tests: [],
      },
    };

    this.ctrfEnvironment = {};

    if (this.reporterConfigOptions?.outputFile !== undefined)
      this.setFilename(this.reporterConfigOptions.outputFile);

    if (
      !fs.existsSync(
        this.reporterConfigOptions.outputDir ?? this.defaultOutputDir
      )
    ) {
      fs.mkdirSync(
        this.reporterConfigOptions.outputDir ?? this.defaultOutputDir,
        { recursive: true }
      );
    }
  }

  onInit(ctx: Vitest): Awaitable<void> {
    this.ctrfReport.results.summary.start = Date.now();
  }

  onFinished(files?: File[], errors?: unknown[]): Awaitable<void> {
    this.updateCtrfTestResultsFromTestResult(files);
    this.ctrfReport.results.summary.stop = Date.now();
    this.writeReportToFile(this.ctrfReport);
  }

  private updateCtrfTestResultsFromTestResult(files: File[] | undefined): void {
    try {
      files?.forEach((file: File) => {
        
        file.tasks.forEach((taskslist: any) => {

          taskslist.tasks.forEach((task: Task) => {
            const testStatus: CtrfTestState = this.mapStatus(
              task?.result?.state ? task?.result?.state : task?.mode
            );

            const test: CtrfTest = {
              name: [task.suite?.name ?? "", task.name]
                .filter((label) => label.length > 0)
                .join(" > "),
              duration: task.result?.duration ?? 0,
              status: testStatus,
            };

            if (this.reporterConfigOptions.minimal === false) {
              test.message = this.extractFailureDetails(task?.result).message;
              test.trace = this.extractFailureDetails(task?.result).trace;
              test.rawStatus = task?.result?.state ?? task?.mode;
              test.type = this.reporterConfigOptions.testType ?? "unit";
              test.filePath = task.suite?.file?.name ?? "";
              test.retries = task?.retry ?? 0;
            }

            this.ctrfReport.results.summary[testStatus]++;
            this.ctrfReport.results.summary.tests++;

            this.ctrfReport.results.tests.push(test);
          });
        });
      });
    } catch (error: any) {
      console.error(
        `error in updateCtrfTestResultsFromTestResult : ${String(error)}`
      );
    }
  }

  private extractFailureDetails(taskResult: any): any {
    if (!taskResult?.errors || taskResult.errors.length === 0) {
      return {
        message: "",
        trace: "",
      };
    }
    return {
      message: taskResult.errors[0].message,
      trace: taskResult.errors[0].stackStr,
    };
  }

  private mapStatus(vitestStatus: TaskState): CtrfTestState {
    switch (vitestStatus) {
      case "pass":
        return "passed";
      case "fail":
        return "failed";
      case "skip":
        return "skipped";
      case "todo":
      case "only":
      case "run":
      default:
        return "other";
    }
  }

  private writeReportToFile(data: CtrfReport): void {
    const filePath = path.join(
      this.reporterConfigOptions.outputDir ?? this.defaultOutputDir,
      this.filename
    );
    const str = JSON.stringify(data, null, 2);
    try {
      fs.writeFileSync(filePath, str + "\n");
      console.log(
        `${this.reporterName}: successfully written ctrf json to %s/%s`,
        this.reporterConfigOptions.outputDir,
        this.filename
      );
    } catch (error) {
      console.error(`Error writing ctrf json report:, ${String(error)}`);
    }
  }

  private setFilename(filename: string): void {
    if (filename.endsWith(".json")) {
      this.filename = filename;
    } else {
      this.filename = `${filename}.json`;
    }
  }
}

export default GenerateCtrfReport;
