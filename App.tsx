import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Upload, 
  Cpu, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  DollarSign,
  Square,
  ArrowRight,
  HelpCircle,
  FileText,
  BarChart3,
  Lightbulb,
  Cloud,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Info,
  ScanEye,
  Sparkles,
  Download
} from 'lucide-react';
import { analyzeArchitecture, generateCostReport } from './services/geminiService';
import { AppStage, AnalysisResult, CostReport } from './types';
import MarkdownRenderer from './components/MarkdownRenderer';
import { CostVisualization } from './components/CostVisualization';

const CONTEXT_TAGS = [
  "B2B SaaS", "High Traffic", "Compliance/Medical", "MVP / Startup", "Internal Tool", "Data Processing", "E-commerce"
];

const App = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.UPLOAD);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  
  // Data State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [contextInput, setContextInput] = useState('');
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);
  
  const [costReport, setCostReport] = useState<CostReport | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const activeRequestRef = useRef(false);

  // Helper function to convert SVG to PNG
  const convertSvgToPng = (svgDataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 1200;
        canvas.height = img.height || 900;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load SVG'));
      img.src = svgDataUrl;
    });
  };

  // Handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = async () => {
        const dataUrl = reader.result as string;

        // If it's an SVG, convert to PNG for Gemini API compatibility
        if (file.type === 'image/svg+xml') {
          try {
            const pngDataUrl = await convertSvgToPng(dataUrl);
            // Create a new File object from PNG data
            const blob = await fetch(pngDataUrl).then(r => r.blob());
            const pngFile = new File([blob], file.name.replace('.svg', '.png'), { type: 'image/png' });
            setSelectedFile(pngFile);
            setImagePreview(pngDataUrl);
          } catch (error) {
            console.error('SVG conversion error:', error);
            alert('Failed to convert SVG. Please try a PNG or JPG file.');
          }
        } else {
          setSelectedFile(file);
          setImagePreview(dataUrl);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleContextTagClick = (tag: string) => {
    setContextInput(prev => prev ? `${prev}, ${tag}` : tag);
  };

  const handleStop = () => {
    activeRequestRef.current = false;
    setIsLoading(false);
    setLoadingText('Processing stopped by user.');
  };

  const startAnalysis = async () => {
    if (!selectedFile || !imagePreview) return;
    
    setIsLoading(true);
    setLoadingText('Analyzing architecture patterns & identifying services...');
    activeRequestRef.current = true;

    try {
      const base64Data = imagePreview.split(',')[1];
      const result = await analyzeArchitecture(base64Data, selectedFile.type, contextInput);
      
      if (activeRequestRef.current) {
        setAnalysisResult(result);
        setStage(AppStage.CLARIFICATION);
        // Initialize empty answers
        const initialAnswers: Record<string, string> = {};
        result.questions.forEach(q => initialAnswers[q.id] = '');
        setUserAnswers(initialAnswers);
        // Scroll to top
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error(error);
      if (activeRequestRef.current) setLoadingText('Error analyzing diagram. Please try again.');
    } finally {
      if (activeRequestRef.current) setIsLoading(false);
    }
  };

  const startEstimation = async () => {
    if (!analysisResult) return;

    setIsLoading(true);
    setLoadingText('Running cost models & simulating billing scenarios...');
    activeRequestRef.current = true;

    try {
      const report = await generateCostReport(analysisResult, userAnswers);

      if (activeRequestRef.current) {
        setCostReport(report);
        setStage(AppStage.REPORT);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error(error);
      if (activeRequestRef.current) setLoadingText('Error generating report. Please try again.');
    } finally {
      if (activeRequestRef.current) setIsLoading(false);
    }
  };

  const exportMarkdown = () => {
    if (!costReport || !analysisResult) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `infrasights-report-${timestamp}.md`;

    // Generate markdown content
    const markdown = `# InfraSights Cost Analysis Report
**Generated:** ${new Date().toLocaleString()}

---

## Architecture Overview

**Cloud Provider:** ${analysisResult.cloud_provider}
**Architecture Pattern:** ${analysisResult.architecture_pattern}
**Confidence Score:** ${costReport.confidence_score}

### Detected Components

${analysisResult.components.map((comp, idx) => `${idx + 1}. **${comp.service}** (${comp.type}) - ${comp.count_estimate || 'N/A'} instances
   - ${comp.notes}`).join('\n')}

### AI Observations

${analysisResult.observations.map(obs => `- ${obs}`).join('\n')}

---

## Cost Estimates

### Summary

| Metric | Amount |
|--------|--------|
| **Monthly Cost** | **$${costReport.total_monthly_cost.toLocaleString()}** |
| **Yearly Cost** | **$${costReport.total_yearly_cost.toLocaleString()}** |
| **Optimistic Range** | $${costReport.ranges.optimistic.toLocaleString()} |
| **Peak Load Range** | $${costReport.ranges.pessimistic.toLocaleString()} |

### Clarifying Questions & Answers

${analysisResult.questions.map((q, idx) => `**Q${idx + 1}:** ${q.text}
**A:** ${userAnswers[q.id] || 'Not answered'}`).join('\n\n')}

---

## Service-by-Service Breakdown

| Service | Configuration | Monthly Cost | Notes |
|---------|--------------|--------------|-------|
${costReport.items.map(item => `| ${item.service} | ${item.configuration} | $${item.monthly_cost.toLocaleString()} | ${item.calculation_note || '-'} |`).join('\n')}

**Total:** $${costReport.total_monthly_cost.toLocaleString()}/month

---

## Executive Summary

${costReport.executive_summary}

---

## Optimization Recommendations

${costReport.recommendations.map((rec, idx) => `### ${idx + 1}. ${rec.title}

**Impact:** ${rec.impact}
**Estimated Savings:** ${rec.estimated_savings}

${rec.description}

---`).join('\n')}

## Disclaimer

This estimate is based on 2024 public cloud pricing and the information provided. Actual costs may vary based on:
- Enterprise agreements and volume discounts
- Spot instance pricing fluctuations
- Data egress and cross-region transfer costs
- Support plan tiers
- Reserved instance commitments
- Seasonal traffic variations

**Always validate with official cloud provider pricing calculators before making infrastructure decisions.**

---

*Report generated by [InfraSights](https://github.com/yourusername/infrasights) - AI-Powered Cloud Cost Estimator*
`;

    // Create and trigger download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- RENDERERS ---

  const renderUploadStage = () => (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in py-12">
      <div className="text-center space-y-6 relative">
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-600/20 blur-[100px] -z-10 rounded-full pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-violet-400 text-xs font-medium mb-4">
          <Sparkles className="w-3 h-3" /> AI-Powered Cloud Estimation
        </div>
        <h1 className="text-6xl font-extrabold tracking-tight text-white">
          Predict your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">cloud bill</span> <br/>
          before you build.
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Upload your architecture diagram. <strong>InfraSights</strong> analyzes every component, asks smart questions, and delivers a senior architect's cost assessment.
        </p>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-violet-500/30 transition-colors duration-500">
        
        {/* Decorative corner glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/10 blur-3xl rounded-full"></div>

        {/* Image Upload */}
        <div className="mb-10">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">1. Architecture Diagram</label>
          <div className={`relative group/upload border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${imagePreview ? 'border-violet-500/50 bg-zinc-950/80' : 'border-zinc-800 hover:border-violet-500/30 hover:bg-zinc-950/50'}`}>
            <input
              type="file"
              accept="image/*,.svg"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileSelect}
              disabled={isLoading}
            />
            
            {imagePreview ? (
              <div className="relative h-72 w-full flex items-center justify-center">
                 <img src={imagePreview} alt="Preview" className="h-full object-contain rounded-lg shadow-2xl" />
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity duration-300 rounded-lg">
                   <Upload className="w-10 h-10 text-white mb-3" />
                   <p className="text-white font-medium">Click to replace image</p>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-500 py-4">
                <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 group-hover/upload:scale-110 group-hover/upload:bg-zinc-800 transition-all duration-300 shadow-xl border border-zinc-800">
                  <Upload className="w-10 h-10 text-violet-400" />
                </div>
                <p className="font-semibold text-zinc-300 text-xl mb-2">Drop your diagram here</p>
                <p className="text-sm text-zinc-500">Supports PNG, JPG, WEBP, SVG</p>
              </div>
            )}
          </div>
        </div>

        {/* Context Input */}
        <div className="mb-10">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">2. Business Context (Optional)</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {CONTEXT_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => handleContextTagClick(tag)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-zinc-700 rounded-full text-xs font-medium text-zinc-400 transition-all active:scale-95"
              >
                + {tag}
              </button>
            ))}
          </div>
          <textarea
            value={contextInput}
            onChange={(e) => setContextInput(e.target.value)}
            placeholder="Tell us about your traffic, compliance needs, or growth goals..."
            className="w-full h-28 bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-zinc-200 focus:ring-2 focus:ring-violet-600/50 focus:border-violet-500 transition-all resize-none placeholder-zinc-600 leading-relaxed"
            disabled={isLoading}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={startAnalysis}
          disabled={!selectedFile || isLoading}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:grayscale text-white py-5 rounded-xl font-bold text-lg shadow-lg shadow-violet-900/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 relative overflow-hidden group/btn"
        >
          {/* Shine effect */}
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/btn:animate-shine" />
          
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanEye className="w-5 h-5" />}
          {isLoading ? 'Analyzing Architecture...' : 'Analyze Architecture'}
        </button>
        
        {isLoading && (
          <div className="mt-6 p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
             <div className="flex items-center gap-2 mb-3">
               <span className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
               </span>
               <span className="text-sm text-zinc-300 font-medium tracking-wide animate-pulse">{loadingText}</span>
             </div>
             <button onClick={handleStop} className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 px-4 py-2 rounded-full border border-red-900/30 transition-colors">
               <Square className="w-3 h-3 fill-current" /> Stop Processing
             </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderClarificationStage = () => {
    if (!analysisResult) return null;
    
    // Calculate progress
    const totalQuestions = analysisResult.questions.length;
    const answeredCount = Object.values(userAnswers).filter((a: string) => a.trim() !== '').length;
    const progress = Math.round((answeredCount / totalQuestions) * 100);

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 pt-10">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <CheckCircle2 className="w-3 h-3" /> Architecture Identified
          </div>
          <h2 className="text-3xl font-bold text-white">We need a few details</h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">
            We've identified <strong>{analysisResult.architecture_pattern}</strong> on <strong>{analysisResult.cloud_provider}</strong>. 
            To calculate precise costs, we need to understand your load.
          </p>
        </div>

        {/* Collapsible Analysis Context */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all backdrop-blur-sm">
          <button 
            onClick={() => setShowAnalysisDetails(!showAnalysisDetails)}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors">
                 <Cloud className="w-5 h-5 text-violet-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-zinc-200">View Architecture Findings</div>
                <div className="text-xs text-zinc-500">
                  {analysisResult.components.length} components found • Click to expand
                </div>
              </div>
            </div>
            {showAnalysisDetails ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
          </button>
          
          {showAnalysisDetails && (
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/30 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2">
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Detected Components</h4>
                <div className="space-y-2">
                  {analysisResult.components.map((comp, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-zinc-300 p-2 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                      <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-mono font-bold">{idx+1}</div>
                      <span>{comp.service}</span>
                      {comp.count_estimate && <span className="ml-auto text-xs text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">x{comp.count_estimate}</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">AI Observations</h4>
                <ul className="space-y-3">
                  {analysisResult.observations.map((obs, idx) => (
                    <li key={idx} className="text-sm text-zinc-400 flex gap-3 leading-relaxed">
                      <span className="text-violet-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></span> 
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Main Questionnaire Card */}
        <div className="bg-zinc-900 border border-violet-500/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800">
            <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(139,92,246,0.5)]" style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className="flex justify-between items-end mb-10 pt-2 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Clarifying Questions</h3>
              <p className="text-xs text-zinc-500 mt-1">Refine your estimate accuracy</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-mono font-bold text-violet-400">{answeredCount}<span className="text-zinc-600 text-lg">/{totalQuestions}</span></span>
            </div>
          </div>

          <div className="space-y-12">
            {analysisResult.questions.map((q, idx) => (
              <div key={q.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-400 shadow-lg">
                    {idx + 1}
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <label className="text-lg font-medium text-zinc-200 leading-snug">{q.text}</label>
                      <div className="group relative pt-1">
                         <Info className="w-4 h-4 text-zinc-600 hover:text-violet-400 cursor-help transition-colors" />
                         <div className="absolute right-0 w-72 p-4 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 top-6 backdrop-blur-xl">
                           <div className="font-semibold text-violet-400 mb-1 flex items-center gap-1"><Lightbulb className="w-3 h-3"/> Context</div>
                           {q.context}
                         </div>
                      </div>
                    </div>
                    
                    {q.options && q.options.length > 0 ? (
                      <div className="space-y-4">
                        {/* Quick Select Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setUserAnswers(prev => ({...prev, [q.id]: opt}))}
                              className={`px-4 py-3.5 rounded-xl text-left text-sm transition-all border relative overflow-hidden group ${
                                userAnswers[q.id] === opt
                                ? 'bg-violet-600/10 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                              }`}
                            >
                              <span className="relative z-10 flex items-center justify-between">
                                {opt}
                                {userAnswers[q.id] === opt && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Custom Text Input for "Other" */}
                        <div className="relative">
                          <label className="text-xs font-medium text-zinc-500 mb-2 block">Or provide a custom answer:</label>
                          <input
                            type="text"
                            value={q.options.includes(userAnswers[q.id] || '') ? '' : (userAnswers[q.id] || '')}
                            onChange={(e) => setUserAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                            onFocus={(e) => {
                              // Clear selection from options when typing custom answer
                              if (q.options.includes(userAnswers[q.id] || '')) {
                                setUserAnswers(prev => ({...prev, [q.id]: ''}));
                              }
                            }}
                            placeholder="Type your specific answer here..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all placeholder-zinc-600"
                          />
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => setUserAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                        placeholder="e.g. 500GB, 10k daily users..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all placeholder-zinc-600"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-end gap-4 items-center">
             {isLoading && (
                <div className="flex items-center gap-3 bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  <span className="text-sm text-zinc-400">{loadingText}</span>
                  <button onClick={handleStop} className="ml-2 text-xs text-red-400 font-medium hover:underline">Stop</button>
                </div>
             )}
             <button
               onClick={startEstimation}
               disabled={isLoading}
               className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:grayscale text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 group"
             >
               Calculate Estimates <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReportStage = () => {
    if (!costReport) return null;
    return (
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20 pt-8">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Cost Projection</h2>
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Estimate
            </div>
          </div>
          <div className="flex gap-3 relative">
             <div className="relative">
               <button
                 onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                 className={`px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-medium text-zinc-300 transition-colors flex items-center gap-2 ${isExportMenuOpen ? 'bg-zinc-800 border-zinc-600 text-zinc-100' : ''}`}
               >
                 <Download className="w-4 h-4" /> Export Report <ChevronDown className={`w-4 h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
               </button>
               
               {isExportMenuOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setIsExportMenuOpen(false)}></div>
                   <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200">
                      <button
                        onClick={() => { exportMarkdown(); setIsExportMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-zinc-800/50 text-sm text-zinc-300 flex items-center gap-2 transition-colors border-b border-zinc-800/50"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" /> Save as Markdown
                      </button>
                      <button
                        onClick={() => { window.print(); setIsExportMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-zinc-800/50 text-sm text-zinc-300 flex items-center gap-2 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-rose-400" /> Print / Save PDF
                      </button>
                   </div>
                 </>
               )}
             </div>

             <button
               onClick={() => { setStage(AppStage.UPLOAD); setIsExportMenuOpen(false); }}
               className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-white/5"
             >
               New Analysis
             </button>
          </div>
        </div>

        {/* HERO: The Big Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Cost Card */}
          <div className="md:col-span-8 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <DollarSign className="w-56 h-56 text-violet-500" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 h-full">
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-sm font-bold text-violet-400 uppercase tracking-widest">Monthly Estimate</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                    costReport.confidence_score === 'High' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {costReport.confidence_score} Confidence
                  </span>
                </div>
                <div>
                  <div className="text-7xl font-extrabold text-white tracking-tighter mb-2 drop-shadow-2xl">
                    ${costReport.total_monthly_cost.toLocaleString()}
                  </div>
                  <div className="text-zinc-400 font-mono text-lg">
                    ~${costReport.total_yearly_cost.toLocaleString()} <span className="text-zinc-600">/ year</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950/60 backdrop-blur-md rounded-2xl p-5 border border-zinc-800 min-w-[240px] shadow-xl">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-4">Projected Variance</p>
                <div className="space-y-4">
                   <div>
                     <div className="flex justify-between items-center text-sm mb-1.5">
                       <span className="text-zinc-300 font-medium">Optimistic</span>
                       <span className="font-mono text-emerald-400">${costReport.ranges.optimistic.toLocaleString()}</span>
                     </div>
                     <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: '40%' }}></div>
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between items-center text-sm mb-1.5">
                       <span className="text-zinc-300 font-medium">Peak Load</span>
                       <span className="font-mono text-rose-400">${costReport.ranges.pessimistic.toLocaleString()}</span>
                     </div>
                     <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]" style={{ width: '85%' }}></div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Opportunity Card */}
          <div className="md:col-span-4 bg-emerald-950/20 border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
             
             <div className="relative z-10">
               <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                  <TrendingDown className="w-6 h-6 text-emerald-400" />
               </div>
               <h3 className="text-lg font-medium text-emerald-200/80 mb-1">Potential Savings</h3>
               <p className="text-4xl font-bold text-white mb-4 tracking-tight">
                 {costReport.recommendations[0]?.estimated_savings || "Analysis Pending"}
               </p>
               <p className="text-sm text-emerald-200/60 leading-relaxed">
                 Implementing our top recommendations could reduce your invoice significantly.
               </p>
             </div>
          </div>
        </div>

        {/* SECTION: Recommendations */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500 fill-amber-500/20" /> 
            Optimization Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {costReport.recommendations.map((rec, i) => (
               <div key={i} className={`flex flex-col rounded-2xl border p-6 transition-all hover:scale-[1.01] hover:shadow-2xl ${
                 rec.impact === 'High' 
                 ? 'bg-gradient-to-b from-zinc-900 to-zinc-900 border-violet-500/30 shadow-lg shadow-violet-900/10' 
                 : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
               }`}>
                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-2 rounded-lg ${
                       rec.impact === 'High' ? 'bg-violet-500/10 text-violet-400' : 'bg-zinc-800 text-zinc-400'
                     }`}>
                       <Sparkles className="w-5 h-5" />
                     </div>
                     <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border ${
                       rec.impact === 'High' ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' : 
                       rec.impact === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                     }`}>
                       {rec.impact} Impact
                     </span>
                  </div>
                  <h4 className="font-bold text-lg text-white mb-3 line-clamp-2">{rec.title}</h4>
                  <div className="text-sm text-zinc-400 mb-6 flex-grow leading-relaxed">
                     <MarkdownRenderer content={rec.description} />
                  </div>
                  <div className="pt-4 border-t border-zinc-800/50 mt-auto flex justify-between items-center">
                    <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Est. Savings</span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/10">{rec.estimated_savings}</span>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* SECTION: The Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-zinc-800">
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <BarChart3 className="w-5 h-5 text-zinc-400" /> Service Breakdown
               </h3>
             </div>
             
             <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
                <CostVisualization items={costReport.items} />
             </div>

             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-zinc-400 uppercase text-xs tracking-wider">Service</th>
                      <th className="px-6 py-4 font-semibold text-zinc-400 uppercase text-xs tracking-wider">Config</th>
                      <th className="px-6 py-4 font-semibold text-zinc-400 text-right uppercase text-xs tracking-wider">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {costReport.items.map((item, i) => (
                      <tr key={i} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-6 py-4 font-medium text-zinc-200">
                          {item.service}
                          {item.calculation_note && (
                            <div className="text-xs text-zinc-500 mt-1 font-normal hidden group-hover:block animate-in fade-in leading-tight">
                              {item.calculation_note}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 max-w-xs truncate font-mono text-xs" title={item.configuration}>{item.configuration}</td>
                        <td className="px-6 py-4 text-right font-mono text-zinc-200 font-medium">${item.monthly_cost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>

          {/* Executive Summary Panel */}
          <div className="lg:col-span-1">
             <div className="sticky top-24 space-y-6">
               <h3 className="text-xl font-bold text-white">Executive Summary</h3>
               <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl ring-1 ring-white/5">
                  <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed">
                    <MarkdownRenderer content={costReport.executive_summary} />
                  </div>
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <p className="text-[10px] text-zinc-600 leading-normal uppercase tracking-wide">
                      <strong>Disclaimer:</strong> Estimates based on 2024 public pricing. Does not account for enterprise agreements, spot fluctuations, or hidden data egress spikes.
                    </p>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-violet-500/30 overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setStage(AppStage.UPLOAD)}>
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2 rounded-lg shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all">
              <ScanEye className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-violet-200 transition-colors">Infra<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Sights</span></span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-medium text-zinc-500">
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${stage === AppStage.UPLOAD ? 'bg-zinc-900 text-violet-400 ring-1 ring-violet-500/30' : ''}`}>
                <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">1</span>
                <span className="hidden sm:inline">Upload</span>
             </div>
             <div className="h-px w-4 bg-zinc-800"></div>
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${stage === AppStage.CLARIFICATION ? 'bg-zinc-900 text-violet-400 ring-1 ring-violet-500/30' : ''}`}>
                <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">2</span>
                <span className="hidden sm:inline">Clarify</span>
             </div>
             <div className="h-px w-4 bg-zinc-800"></div>
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${stage === AppStage.REPORT ? 'bg-zinc-900 text-violet-400 ring-1 ring-violet-500/30' : ''}`}>
                <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">3</span>
                <span className="hidden sm:inline">Report</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 relative">
        {stage === AppStage.UPLOAD && renderUploadStage()}
        {stage === AppStage.CLARIFICATION && renderClarificationStage()}
        {stage === AppStage.REPORT && renderReportStage()}
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);
root.render(<App />);