import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Terminal, Code2, Rocket, Database, Cpu, Zap, GitBranchPlus, GitPullRequest, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

// Mock API functions (simulating backend interaction)
const simulateBuild = async (code: string): Promise<{ success: boolean; log?: string; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network latency
    if (code.includes('error')) {
        return { success: false, error: 'Build failed due to code error.' };
    }
    const buildLog = `
        Building application...
        Compiling code...
        Running tests...
        Tests passed.
        Packaging application...
        Build successful!
    `;
    return { success: true, log: buildLog };
};

const simulateDeploy = async (buildId: string, environment: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    if (environment === 'production' && Math.random() < 0.2) { // Simulate 20% failure rate in production
        return { success: false, error: `Deployment to ${environment} failed.  Reason: Critical system overload.` };
    }
    const message = `Successfully deployed build ${buildId} to ${environment} environment.`;
    return { success: true, message };
};

const simulateTest = async (environment: string): Promise<{ success: boolean; results?: string; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (environment === 'staging' && Math.random() < 0.1) {
        return { success: false, error: "Automated tests failed in staging." };
    }
    const testResults = `
        Running integration tests...
        [PASSED] Test: User authentication
        [PASSED] Test: Data validation
        [PASSED] Test: API response time
        [PASSED] Test: Database connection
        All tests passed.
    `;
    return { success: true, results: testResults };
};

const simulateRollback = async (environment: string, previousVersion: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    if (environment === 'production' && Math.random() < 0.1) {
        return { success: false, error: "Rollback failed: Could not restore database state." };
    }
    const message = `Successfully rolled back ${environment} environment to version ${previousVersion}.`;
    return { success: true, message };
};

const simulateMonitor = async (): Promise<{ metrics: { cpuUsage: number; memoryUsage: number; responseTime: number; errorsPerMinute: number } }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const metrics = {
        cpuUsage: Math.random() * 80, // Simulate CPU usage between 0-80%
        memoryUsage: Math.random() * 90, // Simulate memory usage
        responseTime: Math.random() * 200 + 50, // Simulate response time (50-250ms)
        errorsPerMinute: Math.floor(Math.random() * 5), // Simulate errors per minute (0-5)
    };
    return { metrics };
};

const DevOpsDemoApp = () => {
    const [code, setCode] = useState('// Your application code here...\n// Add an "error" comment to simulate a build failure');
    const [buildStatus, setBuildStatus] = useState<'idle' | 'running' | 'success' | 'failure'>('idle');
    const [buildLog, setBuildLog] = useState('');
    const [deploymentStatus, setDeploymentStatus] = useState<{ [env: string]: 'idle' | 'running' | 'success' | 'failure' }>({
        staging: 'idle',
        production: 'idle',
    });
    const [testResults, setTestResults] = useState<{ [env: string]: string }>({
        staging: '',
        production: '',
    });
    const [rollbackStatus, setRollbackStatus] = useState<{ [env: string]: 'idle' | 'running' | 'success' | 'failure' }>({
        staging: 'idle',
        production: 'idle',
    });
    const [monitoringData, setMonitoringData] = useState<{ cpuUsage: number; memoryUsage: number; responseTime: number; errorsPerMinute: number } | null>(null);
    const [isMonitoringActive, setIsMonitoringActive] = useState(false);
    const [currentVersion, setCurrentVersion] = useState('1.0.0');
    const [previousVersion, setPreviousVersion] = useState('0.9.0'); // For rollback demo
    const [activeBranch, setActiveBranch] = useState('main');
    const [pullRequestStatus, setPullRequestStatus] = useState<'idle' | 'open' | 'merged'>('idle');

    // --- Core DevOps Functions ---

    const handleBuild = async () => {
        setBuildStatus('running');
        setBuildLog('');
        try {
            const result = await simulateBuild(code);
            if (result.success) {
                setBuildStatus('success');
                setBuildLog(result.log || 'Build successful.');
            } else {
                setBuildStatus('failure');
                setBuildLog(result.error || 'Build failed.');
            }
        } catch (error) {
            setBuildStatus('failure');
            setBuildLog('An unexpected error occurred during build.');
        }
    };

    const handleDeploy = async (environment: 'staging' | 'production') => {
        setDeploymentStatus(prev => ({ ...prev, [environment]: 'running' }));
        try {
            const result = await simulateDeploy('1234', environment); // Mock build ID
            if (result.success) {
                setDeploymentStatus(prev => ({ ...prev, [environment]: 'success' }));
                alert(result.message); // Basic feedback
            } else {
                setDeploymentStatus(prev => ({ ...prev, [environment]: 'failure' }));
                alert(`Deployment to ${environment} failed: ${result.error}`);
            }
        } catch (error) {
            setDeploymentStatus(prev => ({ ...prev, [environment]: 'failure' }));
            alert(`Error deploying to ${environment}: ${error}`);
        }
    };

    const handleTest = async (environment: 'staging' | 'production') => {
        try {
            const result = await simulateTest(environment);
            if (result.success) {
                setTestResults(prev => ({ ...prev, [environment]: result.results || 'Tests passed.' }));
            } else {
                setTestResults(prev => ({ ...prev, [environment]: result.error || 'Tests failed.' }));
            }
        } catch (error) {
            setTestResults(prev => ({ ...prev, [environment]: `Error running tests: ${error}` }));
        }
    };

    const handleRollback = async (environment: 'staging' | 'production') => {
        setRollbackStatus(prev => ({ ...prev, [environment]: 'running' }));
        try {
            const result = await simulateRollback(environment, previousVersion);
            if (result.success) {
                setRollbackStatus(prev => ({ ...prev, [environment]: 'success' }));
                alert(result.message);
                // In a real app, you'd also update the current version here.
                setCurrentVersion(previousVersion);
                setPreviousVersion('0.8.0'); // Update to an even older version
            } else {
                setRollbackStatus(prev => ({ ...prev, [environment]: 'failure' }));
                alert(`Rollback to ${environment} failed: ${result.error}`);
            }
        } catch (error) {
            setRollbackStatus(prev => ({ ...prev, [environment]: 'failure' }));
            alert(`Error rolling back ${environment}: ${error}`);
        }
    };

    // --- Monitoring ---
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isMonitoringActive) {
            interval = setInterval(async () => {
                try {
                    const result = await simulateMonitor();
                    setMonitoringData(result.metrics);
                } catch (error) {
                    console.error('Error fetching monitoring data:', error);
                    // In a real app, handle this error (e.g., show a message to the user)
                }
            }, 5000); // Fetch metrics every 5 seconds
        }

        return () => {
            clearInterval(interval);
        };
    }, [isMonitoringActive]);

    const toggleMonitoring = () => {
        setIsMonitoringActive(prev => !prev);
    };

    // --- Git Branching & Pull Request Simulation ---
    const handleCreateBranch = () => {
        setActiveBranch('feature/new-feature'); // Simulate creating a new branch
        alert('Created new branch: feature/new-feature');
    };

    const handleOpenPullRequest = () => {
        setPullRequestStatus('open');
        alert('Opened pull request for feature/new-feature -> main');
    };

    const handleMergePullRequest = () => {
        if (pullRequestStatus === 'open') {
            setPullRequestStatus('merged');
            alert('Merged pull request.  New version deployed!');
            // Simulate a new deployment after merge (in a real app, this would be part of CI/CD)
            setCurrentVersion('1.1.0'); // Increment version
            setActiveBranch('main'); // Switch back to main branch
        } else {
            alert('No open pull request to merge.');
        }
    };

    // --- UI ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    DevOps Demo App
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Build Section */}
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                                <Code2 className="w-5 h-5" /> Build
                            </CardTitle>
                            <CardDescription className="text-gray-400">Compile and package your application.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full min-h-[120px] bg-black/50 text-white p-4 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                                placeholder="Enter your application code here..."
                            />
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={handleBuild}
                                    disabled={buildStatus === 'running'}
                                    className={cn(
                                        "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300",
                                        "transition-colors duration-200",
                                        buildStatus === 'running' && "opacity-70 cursor-not-allowed",
                                        "flex items-center gap-2"
                                    )}
                                >
                                    {buildStatus === 'running' ? (
                                        <>Building...</>
                                    ) : (
                                        <>
                                            <Terminal className="w-4 h-4" />
                                            Run Build
                                        </>
                                    )}
                                </Button>
                                {buildStatus === 'success' && (
                                    <Badge variant="success" className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" /> Success
                                    </Badge>
                                )}
                                {buildStatus === 'failure' && (
                                    <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                                        <XCircle className="w-4 h-4" /> Failure
                                    </Badge>
                                )}
                            </div>
                            {buildLog && (
                                <div className="bg-black/50 p-4 rounded-md border border-gray-700 text-gray-300 font-mono text-sm max-h-48 overflow-y-auto">
                                    <h4 className="font-semibold mb-2">Build Log:</h4>
                                    <pre>{buildLog}</pre>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Deployment Section */}
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                                <Rocket className="w-5 h-5" /> Deploy
                            </CardTitle>
                            <CardDescription className="text-gray-400">Deploy your application to different environments.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['staging', 'production'].map(env => (
                                    <div key={env} className="space-y-2">
                                        <h4 className="text-lg font-medium text-gray-200 capitalize">{env}</h4>
                                        <div className="flex items-center gap-4">
                                            <Button
                                                onClick={() => handleDeploy(env as 'staging' | 'production')}
                                                disabled={deploymentStatus[env] === 'running'}
                                                className={cn(
                                                    "w-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:text-purple-300",
                                                    "transition-colors duration-200",
                                                    deploymentStatus[env] === 'running' && "opacity-70 cursor-not-allowed",
                                                    "flex items-center justify-center gap-2"
                                                )}
                                            >
                                                {deploymentStatus[env] === 'running' ? (
                                                    <>Deploying...</>
                                                ) : (
                                                    <>Deploy to {env}</>
                                                )}
                                            </Button>
                                            {deploymentStatus[env] === 'success' && (
                                                <Badge variant="success" className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" /> Success
                                                </Badge>
                                            )}
                                            {deploymentStatus[env] === 'failure' && (
                                                <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                                                    <XCircle className="w-4 h-4" /> Failure
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Testing Section */}
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                                <ListChecks className="w-5 h-5" /> Test
                            </CardTitle>
                            <CardDescription className="text-gray-400">Run automated tests in different environments.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['staging', 'production'].map(env => (
                                    <div key={env} className="space-y-2">
                                        <h4 className="text-lg font-medium text-gray-200 capitalize">{env}</h4>
                                        <Button
                                            onClick={() => handleTest(env as 'staging' | 'production')}
                                            className="w-full bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 hover:text-yellow-300 transition-colors duration-200 flex items-center justify-center gap-2"
                                        >
                                            Run Tests in {env}
                                        </Button>
                                        {testResults[env] && (
                                            <div className={cn(
                                                "bg-black/50 p-4 rounded-md border border-gray-700 text-gray-300 font-mono text-sm max-h-48 overflow-y-auto",
                                                testResults[env].startsWith("Tests passed") && "text-green-400",
                                                testResults[env].startsWith("Automated tests failed") && "text-red-400"
                                            )}>
                                                <h4 className="font-semibold mb-2">Test Results ({env}):</h4>
                                                <pre>{testResults[env]}</pre>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rollback Section */}
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white">Rollback</CardTitle>
                            <CardDescription className="text-gray-400">Rollback to a previous version.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['staging', 'production'].map(env => (
                                    <div key={env} className="space-y-2">
                                        <h4 className="text-lg font-medium text-gray-200 capitalize">{env}</h4>
                                        <Button
                                            onClick={() => handleRollback(env as 'staging' | 'production')}
                                            disabled={rollbackStatus[env] === 'running'}
                                            className={cn(
                                                "w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300",
                                                "transition-colors duration-200",
                                                rollbackStatus[env] === 'running' && "opacity-70 cursor-not-allowed"
                                            )}
                                        >
                                            {rollbackStatus[env] === 'running' ? `Rolling back...` : `Rollback ${env}`}
                                        </Button>
                                        {rollbackStatus[env] === 'success' && (
                                            <Badge variant="success" className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4" /> Success
                                            </Badge>
                                        )}
                                        {rollbackStatus[env] === 'failure' && (
                                            <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                                                <XCircle className="w-4 h-4" /> Failure
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-gray-300">
                                <p>
                                    Current Version: <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{currentVersion}</Badge>
                                </p>
                                <p>
                                    Previous Version: <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">{previousVersion}</Badge>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Monitoring Section */}
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                                <Cpu className="w-5 h-5" /> Monitoring
                            </CardTitle>
                            <CardDescription className="text-gray-400">Real-time application metrics.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                onClick={toggleMonitoring}
                                className={cn(
                                    "w-full transition-colors duration-200 flex items-center justify-center gap-2",
                                    isMonitoringActive
                                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                                        : "bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300"
                                )}
                            >
                                {isMonitoringActive ? 'Stop Monitoring' : 'Start Monitoring'}
                            </Button>
                            {isMonitoringActive && monitoringData && (
                                <div className="space-y-2">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="bg-black/50 p-4 rounded-md border border-gray-700 text-gray-300"
                                    >
                                        <h4 className="font-semibold">Real-time Metrics:</h4>
                                        <p>CPU Usage: <span className="text-blue-400">{monitoringData.cpuUsage.toFixed(2)}%</span></p>
                                        <p>Memory Usage: <span className="text-purple-400">{monitoringData.memoryUsage.toFixed(2)}%</span></p>
                                        <p>Response Time: <span className="text-yellow-400">{monitoringData.responseTime.toFixed(0)} ms</span></p>
                                        <p>Errors/Minute: <span className={cn(
                                            "font-semibold",
                                            monitoringData.errorsPerMinute > 0 ? "text-red-400" : "text-green-400"
                                        )}>{monitoringData.errorsPerMinute}</span></p>
                                    </motion.div>
                                </div>
                            )}
                            {isMonitoringActive && !monitoringData && (
                                <div className="bg-black/50 p-4 rounded-md border border-gray-700 text-gray-400 animate-pulse">
                                    Fetching metrics...
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Git Branching and Pull Request Section */}
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                                <GitBranchPlus className="w-5 h-5" />
                                Git Branching & Pull Requests
                            </CardTitle>
                            <CardDescription className="text-gray-400">Simulate Git branching and pull request workflows.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <p className="text-gray-300">
                                    Current Branch: <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{activeBranch}</Badge>
                                </p>
                                <Button
                                    onClick={handleCreateBranch}
                                    disabled={activeBranch !== 'main'}
                                    className={cn(
                                        "w-full bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300",
                                        "transition-colors duration-200",
                                        activeBranch !== 'main' && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    Create Feature Branch
                                </Button>
                                <Button
                                    onClick={handleOpenPullRequest}
                                    disabled={activeBranch === 'main' || pullRequestStatus === 'open'}
                                    className={cn(
                                        "w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300",
                                        "transition-colors duration-200",
                                        (activeBranch === 'main' || pullRequestStatus === 'open') && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {pullRequestStatus === 'open' ? 'Pull Request Open' : 'Open Pull Request'}
                                </Button>
                                <Button
                                    onClick={handleMergePullRequest}
                                    disabled={pullRequestStatus !== 'open'}
                                    className={cn(
                                        "w-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:text-purple-300",
                                        "transition-colors duration-200",
                                        pullRequestStatus !== 'open' && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    Merge Pull Request
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DevOpsDemoApp;
