import React, { useState, useCallback } from 'react';
import { getExecutionModeSuggestion, getMediaSummary, getCiCdConfig, generateTestFromNaturalLanguage } from '../services/geminiService';
import { fileToBase64 } from '../utils/helpers';
import { Platform, Browser, GeneratedTest, Status } from '../types';
import ReactMarkdown from 'react-markdown';


const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

type Agent = 'advisor' | 'summarizer' | 'generator' | 'creator';

const AIAgents: React.FC = () => {
    const [activeAgent, setActiveAgent] = useState<Agent>('creator');

    const renderAgent = () => {
        switch (activeAgent) {
            case 'creator': return <NaturalLanguageTestCreator />;
            case 'advisor': return <ExecutionAdvisor />;
            case 'summarizer': return <MediaSummarizer />;
            case 'generator': return <CiCdGenerator />;
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Agents</h1>
            <p className="text-gray-400 mb-6">Leverage AI to optimize your testing workflow.</p>

            <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                <button onClick={() => setActiveAgent('creator')} className={`py-2 px-4 font-semibold whitespace-nowrap ${activeAgent === 'creator' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>Natural Language Test Creator</button>
                <button onClick={() => setActiveAgent('advisor')} className={`py-2 px-4 font-semibold whitespace-nowrap ${activeAgent === 'advisor' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>Execution Mode Advisor</button>
                <button onClick={() => setActiveAgent('summarizer')} className={`py-2 px-4 font-semibold whitespace-nowrap ${activeAgent === 'summarizer' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>Media Summarizer</button>
                <button onClick={() => setActiveAgent('generator')} className={`py-2 px-4 font-semibold whitespace-nowrap ${activeAgent === 'generator' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>CI/CD Config Generator</button>
            </div>
            
            <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
                {renderAgent()}
            </div>
        </div>
    );
};

const ExecutionAdvisor: React.FC = () => {
    const [description, setDescription] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!description) return;
        setIsLoading(true);
        setResult('');
        const suggestion = await getExecutionModeSuggestion(description);
        setResult(suggestion);
        setIsLoading(false);
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-white mb-2">Execution Mode Advisor</h3>
            <p className="text-gray-400 mb-4">Get a recommendation on whether to run your test headful or headless.</p>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your test case, e.g., 'A test that drags a calendar event to a new time slot and verifies the change.'"
                className="w-full bg-gray-900 text-white placeholder-gray-500 border border-gray-600 rounded-md p-3 h-32 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <button onClick={handleSubmit} disabled={isLoading || !description} className="mt-4 px-6 py-2 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-dark disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center">
                 {isLoading ? <Spinner /> : 'Get Recommendation'}
            </button>
            {result && (
                // FIX: The `className` prop is not supported on `ReactMarkdown`.
                // Tailwind's typography styles are applied to the parent container.
                 <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-md prose prose-invert">
                    <ReactMarkdown>{result}</ReactMarkdown>
                </div>
            )}
        </div>
    );
}

const MediaSummarizer: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult('');
        }
    };
    
    const handleSubmit = async () => {
        if (!file) return;
        setIsLoading(true);
        setResult('');
        try {
            const base64Image = await fileToBase64(file);
            const summary = await getMediaSummary(base64Image, file.type);
            setResult(summary);
        } catch (error) {
            setResult("Failed to process the image.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-white mb-2">Media Summarizer</h3>
            <p className="text-gray-400 mb-4">Upload a test failure screenshot to get an AI-powered analysis.</p>
            <div className="flex gap-6">
                <div className="flex-1">
                     <input type="file" id="file-upload" accept="image/png, image/jpeg" onChange={handleFileChange} className="hidden" />
                     <label htmlFor="file-upload" className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary">
                         {preview ? <img src={preview} alt="Preview" className="h-full w-full object-contain p-2" /> : <p className="text-gray-500">Click to upload screenshot</p>}
                     </label>
                      <button onClick={handleSubmit} disabled={isLoading || !file} className="mt-4 px-6 py-2 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-dark disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center">
                        {isLoading ? <Spinner/> : 'Analyze Image'}
                    </button>
                </div>
                <div className="flex-1">
                    {result && (
                        <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-md h-full">
                            <h4 className="font-bold mb-2">Analysis Result:</h4>
                            {/* FIX: The `className` prop is not supported on `ReactMarkdown`.
                            Wrapped in a div to apply Tailwind's typography styles without affecting sibling elements. */}
                            <div className="prose prose-invert prose-sm">
                                <ReactMarkdown>{result}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const CiCdGenerator: React.FC = () => {
    const [testName, setTestName] = useState('User Login Flow');
    const [platform, setPlatform] = useState<Platform>(Platform.Ubuntu);
    const [browser, setBrowser] = useState<Browser>(Browser.Chrome);
    const [mode, setMode] = useState<'headless' | 'headful'>('headless');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async () => {
        setIsLoading(true);
        setResult('');
        const config = await getCiCdConfig(testName, platform, browser, mode);
        setResult(config);
        setIsLoading(false);
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-white mb-2">CI/CD Config Generator</h3>
            <p className="text-gray-400 mb-4">Generate pipeline configurations for Jenkins and GitHub Actions.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <input type="text" value={testName} onChange={e => setTestName(e.target.value)} placeholder="Test Name" className="bg-gray-900 border border-gray-600 rounded p-2 focus:ring-brand-primary focus:outline-none"/>
                <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="bg-gray-900 border border-gray-600 rounded p-2 focus:ring-brand-primary focus:outline-none">
                    {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={browser} onChange={e => setBrowser(e.target.value as Browser)} className="bg-gray-900 border border-gray-600 rounded p-2 focus:ring-brand-primary focus:outline-none">
                    {Object.values(Browser).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={mode} onChange={e => setMode(e.target.value as 'headless' | 'headful')} className="bg-gray-900 border border-gray-600 rounded p-2 focus:ring-brand-primary focus:outline-none">
                    <option value="headless">Headless</option>
                    <option value="headful">Headful</option>
                </select>
            </div>
            <button onClick={handleSubmit} disabled={isLoading} className="px-6 py-2 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-dark disabled:bg-gray-600 flex items-center justify-center">
                 {isLoading ? <Spinner /> : 'Generate Config'}
            </button>
            {result && (
                <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-md max-h-[50vh] overflow-auto">
                     <ReactMarkdown
                        components={{
                            pre: ({node, ...props}) => <pre className="bg-gray-900 p-2 rounded" {...props} />,
                            code: ({node, ...props}) => <code className="text-sm" {...props} />
                        }}
                     >{result}</ReactMarkdown>
                </div>
            )}
        </div>
    );
};


const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const statusStyles = {
  [Status.Passed]: 'bg-status-pass/20 text-status-pass',
  [Status.Failed]: 'bg-status-fail/20 text-status-fail',
};

const NaturalLanguageTestCreator: React.FC = () => {
    const [userInput, setUserInput] = useState("navigate to Google.com and search for 'Debra Molinski' and check the first result returned is 'Deb Molinski - United States Cold Storage, Inc.'");
    const [generatedTest, setGeneratedTest] = useState<GeneratedTest | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRunning, setIsRunning] = useState<false | 'headless' | 'headful'>(false);
    const [runResult, setRunResult] = useState<{ status: Status; reportUrl: string; videoUrl: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleReset = () => {
        setUserInput('');
        setGeneratedTest(null);
        setIsConfirmed(false);
        setIsGenerating(false);
        setIsRunning(false);
        setRunResult(null);
        setError(null);
    };

    const handleGenerate = async () => {
        if (!userInput) return;
        setIsGenerating(true);
        setGeneratedTest(null);
        setRunResult(null);
        setError(null);
        try {
            const result = await generateTestFromNaturalLanguage(userInput);
            setGeneratedTest(result);
        } catch (e) {
            console.error(e);
            setError("Failed to generate test. The AI might be unable to understand the request. Please try rephrasing.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleConfirm = () => {
        setIsConfirmed(true);
        // In a real app, this would save to a DB.
        console.log("Test confirmed and saved:", {
            id: crypto.randomUUID(),
            ...generatedTest,
            createdAt: new Date().toISOString(),
        });
    };

    const handleRun = (mode: 'headless' | 'headful') => {
        setIsRunning(mode);
        setRunResult(null);
        // Simulate test execution
        setTimeout(() => {
            setRunResult({
                status: Math.random() > 0.3 ? Status.Passed : Status.Failed,
                reportUrl: '#',
                videoUrl: '#',
            });
            setIsRunning(false);
        }, 3000);
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-white mb-2">Natural Language Test Creator</h3>
            <p className="text-gray-400 mb-4">Describe a test in plain English, and the AI will generate, confirm, and run it for you.</p>

            {/* Step 1: Input */}
            {!generatedTest && !isGenerating && (
                <>
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="e.g., Go to example.com, click the 'Login' button, and verify the text 'Welcome back' is visible."
                        className="w-full bg-gray-900 text-white placeholder-gray-500 border border-gray-600 rounded-md p-3 h-32 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                    <button onClick={handleGenerate} disabled={!userInput} className="mt-4 px-6 py-2 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-dark disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center">
                        Generate Test Steps
                    </button>
                </>
            )}
            
            {isGenerating && <div className="flex items-center justify-center p-8"><Spinner /> <span className="ml-4">Generating test...</span></div>}
            {error && <div className="mt-4 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-md">{error}</div>}

            {/* Step 2: Confirmation */}
            {generatedTest && !isConfirmed && (
                <div className="p-6 bg-gray-900/50 border border-gray-700 rounded-lg">
                    <h4 className="font-bold text-lg text-white mb-3">Please confirm the following steps for: <span className="text-brand-light">{generatedTest.testName}</span></h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-300">
                        {generatedTest.humanReadableSteps.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                    <div className="mt-6 flex space-x-4">
                        <button onClick={() => setGeneratedTest(null)} className="px-5 py-2 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-500 flex items-center space-x-2">
                           <EditIcon className="w-5 h-5"/> <span>Edit</span>
                        </button>
                        <button onClick={handleConfirm} className="px-5 py-2 bg-status-pass text-white font-bold rounded-md hover:bg-green-600 flex items-center space-x-2">
                           <CheckIcon className="w-5 h-5"/> <span>Confirm & Save</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Run */}
            {isConfirmed && (
                 <div className="p-6 bg-gray-900/50 border border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-lg text-white">Test Saved: <span className="text-brand-light">{generatedTest?.testName}</span></h4>
                            <p className="text-sm text-green-400 flex items-center"><CheckIcon className="w-4 h-4 mr-1"/> Ready to execute.</p>
                        </div>
                         <button onClick={handleReset} className="text-sm text-gray-400 hover:text-white">Create New Test</button>
                    </div>
                    
                    {!isRunning && !runResult && (
                        <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <button onClick={() => handleRun('headless')} className="flex-1 px-5 py-3 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-dark flex items-center justify-center space-x-2">
                                <PlayIcon className="w-5 h-5"/> <span>Run in Headless Mode</span>
                            </button>
                            <button onClick={() => handleRun('headful')} className="flex-1 px-5 py-3 bg-brand-secondary text-gray-900 font-bold rounded-md hover:bg-blue-300 flex items-center justify-center space-x-2">
                                <PlayIcon className="w-5 h-5"/> <span>Run with Browser UI</span>
                            </button>
                        </div>
                    )}

                    {isRunning && <div className="flex items-center justify-center p-8"><Spinner /> <span className="ml-4">Executing test in {isRunning} mode...</span></div>}

                     {/* Step 4: Results */}
                    {runResult && (
                        <div className="mt-6">
                            <h4 className="font-bold text-lg text-white mb-3">Execution Result</h4>
                            <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg flex items-center space-x-4">
                                <span className={`px-3 py-1 text-sm font-bold rounded-full ${statusStyles[runResult.status]}`}>
                                    {runResult.status}
                                </span>
                                <div className="flex-grow flex flex-col sm:flex-row sm:space-x-4 text-brand-light font-semibold">
                                    <a href={runResult.reportUrl} className="hover:underline">View Allure Report</a>
                                    <a href={runResult.videoUrl} className="hover:underline">Watch Video</a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


export default AIAgents;