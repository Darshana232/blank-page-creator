"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Wrench, Sparkles } from "lucide-react";
import { CodeEditor } from "@/components/CodeEditor";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BackgroundDoodles } from "@/components/BackgroundDoodles";
import { ThemeProvider, useTheme } from "next-themes";
import { ModeSelector, DebuggerMode } from "@/components/ModeSelector";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

import { EnhancedOutputTerminal } from "@/components/EnhancedOutputTerminal";
import { Textarea } from "@/components/ui/textarea";

const defaultCode = `# Welcome to AI Code Debugger!
# Write or paste your Python code here

def greet(name):
    print(f"Hello, {name}!")

greet("Developer")
`;

type PatchChange = {
  iteration: number;
  fix_method: string;
  error_type: string;
  change_type: "added" | "removed";
  line_old: number | null;
  line_new: number | null;
  old_text: string;
  new_text: string;
  reason: string;
};

// Mode-specific repair messages
const repairMessagesByMode: Record<DebuggerMode, string[]> = {
  hacker: [
    "💻 Initiating breach protocol…",
    "🛰️ Uplink established to satellite cluster…",
    "🔓 Bypassing syntax firewalls…",
    "📡 Intercepting stray semicolons…",
    "🧨 Injecting zero-day patches…",
    "💾 Downloading compiler intel from Area 51…",
    "🛸 Negotiating indentation treaties…",
    "🕵️ Writing unit tests behind your back…",
    "🚁 Deploying tactical recursion drones…",
    "⚡ Overclocking logic units to unsafe levels…",
    "🔐 Decrypting indentation anomaly…",
    "🎯 Target acquired: your broken syntax…",
  ],
  "dark-humor": [
    "💀 Your code died. Performing autopsy…",
    "🧨 Found bug. Placed C4. Step back.",
    "🧯 Putting out the dumpster fire…",
    "😈 Introducing new bugs for company…",
    "🪦 Rest in peace, missing parenthesis…",
    "🫠 Melting spaghetti logic…",
    "🎢 Emotional damage detected. Stabilizing…",
    "🤡 Removing clown logic…",
    "☠️ Your code just flatlined at line 4…",
    "🩸 Bleeding out exceptions everywhere…",
    "⚰️ Preparing funeral for your functions…",
    "👻 Haunted by ghost variables…",
  ],
  corporate: [
    "📈 Forwarding bugs to upper management…",
    "📊 Selling bug patterns to advertisers…",
    "💼 Performance review: your code failed…",
    "📉 Reducing quality for quarterly forecasts…",
    "🔗 Auditing indentation for tax evasion…",
    "📦 Packaging mistakes as premium subscription…",
    "💸 Converting bugs into billable hours…",
    "🔒 Encrypting code and charging for the key…",
    "💰 Monetizing your runtime errors…",
    "📋 Filing TPS report on your syntax…",
    "🏆 Your bugs exceed shareholder expectations…",
    "⚖️ Escalating to Premium Fixing Department…",
  ],
};

const getDynamicIterations = (code: string): number => {
  const lines = code.split("\n").length;
  if (lines <= 10) return 5;
  if (lines <= 30) return 9;
  if (lines <= 50) return 15;
  return Math.min(15 + Math.floor((lines - 50) / 25), 30);
};

const IndexContent = () => {
  const { theme } = useTheme();
  const { toast } = useToast();

  const [code, setCode] = useState(defaultCode);
  const [originalCode, setOriginalCode] = useState(defaultCode);

  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const [responseTime, setResponseTime] = useState<number>();
  const [patches, setPatches] = useState<PatchChange[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [userInstructions, setUserInstructions] = useState("");
  const [debuggerMode, setDebuggerMode] = useState<DebuggerMode>("hacker");

  const finalCodeRef = useRef("");
  const isShowingFinalRef = useRef(false);
  const autoRunTimeoutRef = useRef<any>(null);

  const isRepairingRef = useRef(false);
  const textUpdateIntervalRef = useRef<any>(null);
  const messageIndexRef = useRef(0);

  // Update terminal text while repairing
  const startTerminalAnimation = () => {
    isRepairingRef.current = true;
    const messages = repairMessagesByMode[debuggerMode];

    setOutput(messages[0]);

    textUpdateIntervalRef.current = setInterval(() => {
      if (!isRepairingRef.current) return;

      messageIndexRef.current =
        (messageIndexRef.current + 1) % messages.length;

      setOutput(messages[messageIndexRef.current]);
    }, 3500);
  };

  const stopTerminalAnimation = () => {
    isRepairingRef.current = false;
    clearInterval(textUpdateIntervalRef.current);
  };

  const handleEditorChange = (value?: string) => {
    const newVal = value || "";
    setCode(newVal);

    if (!isShowingFinalRef.current) {
      setOriginalCode(newVal);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      setOriginalCode(content);
      toast({ title: "File uploaded", description: file.name });
    };
    reader.readAsText(file);
  };

  const handleRun = async (overrideCode?: string) => {
    const execCode = overrideCode || code;

    setIsLoading(true);
    const start = Date.now();

    try {
      const res = await fetch("http://localhost:8000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: execCode }),
      });

      const data = await res.json();
      const end = Date.now();

      setResponseTime(end - start);
      setOutput(
        (data.stdout || "") + (data.stderr ? "\n" + data.stderr : "")
      );

      setStatus(data.error_type === "NONE" ? "success" : "error");
    } catch {
      setOutput("Runtime Error: Could not execute the code.");
      setStatus("error");
    }

    setIsLoading(false);
  };

  const handleRepair = async () => {
    if (!userInstructions.trim()) {
      toast({
        title: "Missing Instructions",
        description: "Enter a prompt before repairing.",
        variant: "destructive",
      });
      return;
    }

    isRepairingRef.current = true;
    messageIndexRef.current = 0;
    startTerminalAnimation();

    setIsLoading(true);
    const start = Date.now();
    const maxIterations = getDynamicIterations(code);

    try {
      const res = await fetch("http://localhost:8000/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          prompt: userInstructions,
          max_iterations: maxIterations.toString(),
        }),
      });

      const data = await res.json();
      const end = Date.now();

      stopTerminalAnimation();
      setResponseTime(end - start);

      finalCodeRef.current = data.final_code || "";
      setCode(finalCodeRef.current);
      isShowingFinalRef.current = true;

      setPatches(data.changes || []);
      setOutput(data.parsed_error?.last_iteration?.stdout || "");
      setStatus(
        data.parsed_error?.final_status === "SUCCESS" ? "success" : "error"
      );

      toast({
        title: "Repair Completed",
        description: `Iterations: ${maxIterations}`,
      });

      if (autoRunTimeoutRef.current) {
        clearTimeout(autoRunTimeoutRef.current);
      }

      autoRunTimeoutRef.current = setTimeout(() => {
        handleRun(finalCodeRef.current);
      }, 1500);
    } catch {
      stopTerminalAnimation();
      toast({
        title: "Repair Failed",
        description: "Unable to repair your code.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleRevert = () => {
    isShowingFinalRef.current = false;
    stopTerminalAnimation();
    setCode(originalCode);
    setPatches([]);

    toast({
      title: "Reverted",
      description: "Restored your last edited code.",
    });
  };

  const handleClearOutput = () => {
    setOutput("");
    setStatus("idle");
    setResponseTime(undefined);
  };

  const repairGlow =
    userInstructions.trim() && !isLoading
      ? "shadow-[0_0_14px_rgba(0,200,255,0.9)] scale-[1.04]"
      : "opacity-60";

  // Mode-specific background classes
  const modeBackgrounds: Record<DebuggerMode, string> = {
    hacker: "bg-gradient-to-br from-slate-950 via-cyan-950/20 to-slate-950",
    "dark-humor": "bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950",
    corporate: "bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950",
  };

  return (
    <div className={`min-h-screen ${modeBackgrounds[debuggerMode]} flex flex-col transition-colors duration-700`}>

      <div className="fixed inset-0 -z-50">
        <BackgroundDoodles />
      </div>

      {/* HEADER */}
      <header className="relative z-10 px-6 py-4 border-b border-border bg-card/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>

            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                AI Code Debugger
              </h1>
              <p className="text-xs text-muted-foreground">
                Intelligent Python debugging assistant
              </p>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <ThemeToggle />

            <Button onClick={() => handleRun()} disabled={isLoading} className="gap-2">
              <Play className="w-4 h-4" />
              Run
            </Button>

            <Button
              onClick={handleRepair}
              disabled={isLoading}
              variant="outline"
              className={`gap-2 transition-all duration-300 ${repairGlow}`}
            >
              <Wrench className="w-4 h-4" />
              Repair
            </Button>
          </div>

        </div>
      </header>

      {/* MODE SELECTOR */}
      <ModeSelector selectedMode={debuggerMode} onModeChange={setDebuggerMode} />

      {/* INSTRUCTIONS */}
      <div className="z-10 px-4 md:px-6 py-3 border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">

          <label className="text-sm font-medium text-muted-foreground flex-shrink-0">
            Instructions:
          </label>

          <Textarea
            value={userInstructions}
            onChange={(e) => setUserInstructions(e.target.value)}
            placeholder="Describe what changes you want..."
            className="w-full min-h-[60px] bg-background/50"
          />
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex min-h-0" style={{ minHeight: '600px' }}>
        <ResizablePanelGroup direction="horizontal" className="flex-1">

          {/* LEFT: EDITOR */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="h-full p-4 md:p-6 overflow-auto">
              <CodeEditor
                code={code}
                onChange={handleEditorChange}
                onFileUpload={handleFileUpload}
                theme={theme === "light" ? "light" : "vs-dark"}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* RIGHT SIDE */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <ResizablePanelGroup direction="vertical" className="flex-1">

              {/* TERMINAL */}
              <ResizablePanel defaultSize={50} minSize={20}>
                <div className="h-full flex flex-col p-3 md:p-4 bg-muted/10 border-l overflow-hidden">

                  <h3 className="text-sm font-bold mb-2 flex-shrink-0">Output Terminal</h3>

                  <div className="flex-1 min-h-0 overflow-auto">
                    <EnhancedOutputTerminal
                      output={output}
                      status={status}
                      responseTime={responseTime}
                      isLoading={isLoading}
                      onClear={handleClearOutput}
                      onRefresh={() => handleRun()}
                    />
                  </div>

                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* PATCH VIEWER */}
              <ResizablePanel defaultSize={50} minSize={20}>
                <div className="h-full flex flex-col p-3 md:p-4 bg-muted/10 border-l overflow-hidden">

                  <div className="flex justify-between items-center gap-2 mb-2 flex-shrink-0 flex-wrap">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      Patches Viewer
                      {patches.length > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                          {patches.length}
                        </span>
                      )}
                    </h3>

                    {patches.length > 0 && (
                      <Button size="sm" variant="outline" onClick={handleRevert}>
                        Revert
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 min-h-0 overflow-auto space-y-2 pr-2">
                    {patches.length > 0 ? (
                      patches.map((p, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded border text-sm ${p.change_type === "removed"
                              ? "bg-red-500/20 border-red-400"
                              : "bg-green-500/20 border-green-400"
                            }`}
                        >
                          <div className="font-mono opacity-70 text-xs break-all">
                            {p.change_type.toUpperCase()} — old:
                            {p.line_old || "-"} → new:{p.line_new || "-"}
                          </div>

                          {p.old_text && (
                            <div className="mt-1 text-red-300 line-through text-xs break-all">
                              {p.old_text}
                            </div>
                          )}

                          {p.new_text && (
                            <div className="mt-1 text-green-300 text-xs break-all">
                              {p.new_text}
                            </div>
                          )}

                          <div className="mt-1 text-xs opacity-60">{p.reason}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No patches generated.</p>
                    )}
                  </div>

                </div>
              </ResizablePanel>

            </ResizablePanelGroup>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>

    </div>
  );
};

const Index = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <IndexContent />
  </ThemeProvider>
);

export default Index;
