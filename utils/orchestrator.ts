import { ParserAgent } from "./agents/ParserAgent";
import { AnalysisAgent } from "./agents/AnalysisAgent";
import { RewriterAgent } from "./agents/RewriterAgent";
import { EvaluatorAgent } from "./agents/EvaluatorAgent";
import { ResumeData, Evaluation, ResumeAnalysis } from "../types/resume";

export interface OrchestratorResult {
  rewritten: string;
  evaluation: Evaluation;
  analysis:ResumeAnalysis;
}

export class Orchestrator {
  private parser = new ParserAgent();
  private comparator = new AnalysisAgent();
  private rewriter = new RewriterAgent();
  private evaluator = new EvaluatorAgent();

  async enhance(resumeText: string, jobDescription: string): Promise<OrchestratorResult> {
    const parsed: ResumeData = await this.parser.parse(resumeText);
    console.log("Parsing completed, Moving to analysis.");
    const analysis: ResumeAnalysis = await this.comparator.compare(parsed, jobDescription);
    console.log("Resume analysis completed, Moving to rewriting.");
    const rewritten: string = await this.rewriter.rewrite(resumeText, jobDescription);
    console.log("Resume rewriting completed, Moving to evaluation.");
    const evaluation: Evaluation = await this.evaluator.evaluate(resumeText, rewritten, jobDescription);
    console.log("Resume evaluation completed.");
    return { rewritten, evaluation, analysis };
  }
}
