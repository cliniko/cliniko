import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Bot, ClipboardPaste, Clipboard, Loader2, Sparkles, Brain, User, Cpu, Stars, Key, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Progress
} from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Import WebLLM pipeline
import { pipeline, env } from '@xenova/transformers';

// AI processing types
type AIProcessingType = 'clinical-notes';

// Patient and consultation data structure matching ConsultForm fields
interface ExtractedMedicalInfo {
  // Patient demographic information
  patient: {
    name?: string;
    dateOfBirth?: string;
    age?: number;
    gender?: string;
    contact?: string;
    email?: string;
    address?: string;
    patientType?: string; // new, follow_up, emergency, chronic
    patientId?: string;
  };
  // Consultation information
  consultation: {
    date?: string;
    time?: string;
    chiefComplaint: string;
    subjective: string[];
    objective: string[];
    assessment: {
      diagnoses: {
        code?: string;
        description: string;
      }[];
    };
    plan: string[];
    prescriptions: {
      drug: string;
      form?: string;
      dosage?: string;
      frequency?: string;
      duration?: string;
      instructions?: string;
    }[];
    vitals: {
      bloodPressure?: string;
      heartRate?: string;
      temperature?: string;
      respiratoryRate?: string;
      oxygenSaturation?: string;
      height?: string;
      weight?: string;
    };
    followUpRecommendations?: string;
    attendingPhysician?: string;
    attendingNurse?: string;
    bpMonitoring?: boolean;
    hba1cMonitoring?: boolean;
  };
}

// WebLLM specific configuration
// Configure transformers.js to use CDN
env.allowLocalModels = false;
env.useBrowserCache = true;

// Helper function to get API key
const getApiKey = () => {
  // Using the provided API key
  const apiKey = 'AIzaSyBjAU6OvCn0nfVvcg1yvPJ29Rspf40slSM';
  
  // Validate key format
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
    console.error('Invalid API key format');
    throw new Error('Invalid API key format or missing API key');
  }
  
  return apiKey;
};

// Process clinical notes with AI
const processWithAI = async (
  notes: string, 
  updateProgress?: (progress: number, stage?: string) => void
): Promise<ExtractedMedicalInfo> => {
  try {
    // Common prompt for medical data extraction
    const prompt = `
You are a medical data extraction AI assistant. Extract structured patient and consultation information from the following clinical notes.
Format your response as a valid JSON object with the following structure:
{
  "patient": {
    "name": string,
    "dateOfBirth": string (YYYY-MM-DD),
    "age": number,
    "gender": string,
    "contact": string,
    "email": string, 
    "address": string,
    "patientType": string (new, follow_up, emergency, chronic),
    "patientId": string
  },
  "consultation": {
    "date": string (YYYY-MM-DD),
    "time": string (HH:MM),
    "chiefComplaint": string,
    "subjective": string[],
    "objective": string[],
    "assessment": {
      "diagnoses": [
        {
          "code": string (ICD-10),
          "description": string
        }
      ]
    },
    "plan": string[],
    "prescriptions": [
      {
        "drug": string,
        "form": string,
        "dosage": string, 
        "frequency": string,
        "duration": string,
        "instructions": string
      }
    ],
    "vitals": {
      "bloodPressure": string,
      "heartRate": string,
      "temperature": string,
      "respiratoryRate": string,
      "oxygenSaturation": string,
      "height": string,
      "weight": string
    },
    "followUpRecommendations": string,
    "attendingPhysician": string,
    "attendingNurse": string,
    "bpMonitoring": boolean,
    "hba1cMonitoring": boolean
  }
}

IMPORTANT: Extract only the information that is present in the notes. Many fields may be missing - this is expected.
If certain information is not present, omit those fields entirely rather than including them with null/empty values.
Focus on accurately extracting whatever information is available, even if it's just a patient name or a few symptoms.

ONLY return the JSON object with no additional explanations.

Clinical notes:
${notes}
    `;

    let response;
    let jsonString;

    updateProgress?.(5, "Initializing");
    updateProgress?.(20, "Connecting to API");
    
    // For AI processing
    const apiKey = getApiKey();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    // Log information about request for debugging
    console.log('Processing request with:', {
      apiUrlDomain: apiUrl.split('?')[0],
      notesLength: notes.length,
      apiKeyValid: !!apiKey && apiKey.length > 10
    });
    
    // Simulate progress while waiting for API response
    const progressInterval = setInterval(() => {
      const randomIncrement = Math.random() * 3;
      const currentProgress = 20 + randomIncrement;
      updateProgress?.(
        Math.min(90, currentProgress), 
        "Processing"
      );
    }, 600);
    
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topP: 1,
            topK: 32,
            maxOutputTokens: 2048,
            stopSequences: []
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ]
        })
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: `HTTP error ${response.status}` } }));
        console.error('API Response Error:', errorData);
        throw new Error(errorData.error?.message || `API error: ${response.status} ${response.statusText}`);
      }
      
      updateProgress?.(92, "Processing results");
      const data = await response.json();
      
      console.log('API Response Data:', data);
      
      // Extract text from response
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        jsonString = data.candidates[0].content.parts[0].text;
      } else {
        console.error("Unexpected API response format:", JSON.stringify(data));
        throw new Error("Unexpected response format from AI API");
      }
    } catch (error) {
      clearInterval(progressInterval);
      
      // Enhance network error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: ${error.message}. Check your internet connection.`);
      }
      
      throw error;
    }

    updateProgress?.(95, "Extracting structured data");

    // Handle potential JSON wrapper artifacts
    let extractedJson = jsonString.replace(/```json|```/g, '').trim();
    
    // Extra cleanup for common formatting issues from LLMs
    // Find the JSON object within the text - look for pattern starting with { and ending with }
    const jsonMatch = extractedJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      extractedJson = jsonMatch[0];
    }

    updateProgress?.(97, "Validating data");

    // Parse and ensure the result has valid structure
    try {
      const result = JSON.parse(extractedJson);
      
      // Ensure basic structure exists
      const finalResult: ExtractedMedicalInfo = {
        patient: result.patient || {},
        consultation: {
          chiefComplaint: result.consultation?.chiefComplaint || "Not provided",
          subjective: result.consultation?.subjective || [],
          objective: result.consultation?.objective || [],
          assessment: {
            diagnoses: result.consultation?.assessment?.diagnoses || []
          },
          plan: result.consultation?.plan || [],
          prescriptions: result.consultation?.prescriptions || [],
          vitals: result.consultation?.vitals || {},
          bpMonitoring: result.consultation?.bpMonitoring || false,
          hba1cMonitoring: result.consultation?.hba1cMonitoring || false
        }
      };
      
      updateProgress?.(100, "Complete");
      return finalResult;
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      throw new Error("Failed to parse AI response as JSON");
    }
  } catch (error) {
    console.error('Error in AI processing:', error);
    // Add more detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract information from clinical notes: ${errorMessage}`);
  }
};

const AINotes = () => {
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedMedicalInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [simulateError, setSimulateError] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'ok' | 'error'>('unknown');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const { toast } = useToast();

  // Sample clinical notes for demo
  const sampleNotes = `PATIENT: John Smith
DATE OF BIRTH: 1982-09-15
GENDER: Male
PATIENT ID: SM12345
DATE: 2023-06-10
TIME: 09:30 AM

CHIEF COMPLAINT: Persistent cough for 2 weeks with chest pain

HISTORY:
- Patient reports dry cough for 14 days
- Chest pain when coughing, rated 4/10
- No fever or chills
- Has history of seasonal allergies
- No recent travel

VITALS:
BP: 128/82
HR: 76
Temp: 37.1°C
RR: 16
O2: 98%
Height: 180 cm
Weight: 82 kg

EXAMINATION:
- Lungs: Scattered wheezing in upper lobes
- Heart: Regular rate and rhythm, no murmurs
- Throat: Mild erythema, no exudate

ASSESSMENT:
- Acute bronchitis (J20.9)
- Seasonal allergies

PLAN:
- Prescribed albuterol inhaler 2 puffs q6h prn
- Recommended increased fluid intake
- Return in 1 week if symptoms persist
- BP monitoring recommended

Dr. Emily Johnson`;

  // Load sample notes into the textarea
  const loadSampleNotes = () => {
    setClinicalNotes(sampleNotes);
    toast({
      description: "Sample clinical notes loaded",
    });
  };

  // Test API connection to see if the key is valid
  const testApiConnection = async () => {
    try {
      setApiStatus('unknown');
      const apiKey = getApiKey();
      // Testing the flash model specifically
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash?key=${apiKey}`;
      
      console.log('Testing API connection with URL:', testUrl.split('?')[0]);
      
      const response = await fetch(testUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API connection successful. Model info:', data);
        
        setApiStatus('ok');
        toast({
          title: "API connection successful",
          description: "Your API key is working correctly with gemini-2.0-flash model.",
        });
      } else {
        const error = await response.json();
        console.error("API connection test failed:", error);
        setApiStatus('error');
        toast({
          title: "API connection failed",
          description: `Error: ${error.error?.message || response.statusText}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("API test error:", error);
      setApiStatus('error');
      toast({
        title: "API connection failed",
        description: error instanceof Error ? error.message : "Connection error",
        variant: "destructive"
      });
    }
  };

  const handleProcessNotes = async () => {
    if (!clinicalNotes.trim()) {
      toast({
        title: "Empty notes",
        description: "Please enter or paste clinical notes to analyze",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);
      setProgressStage('');
      setErrorDetails(null);
      
      // Simulate error if debug flag is set
      if (simulateError) {
        // Wait to simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        throw new Error("Simulated processing error for testing");
      }
      
      // API key validation
      try {
        getApiKey();
      } catch (keyError) {
        throw new Error(`API Key Error: ${keyError instanceof Error ? keyError.message : 'Invalid API key'}`);
      }
      
      // Process notes with AI
      const result = await processWithAI(
        clinicalNotes,
        (progress, stage) => {
          setProgress(progress);
          if (stage) setProgressStage(stage);
        }
      );
      
      setExtractedInfo(result);
      
      toast({
        title: "Analysis complete",
        description: "Clinical notes have been processed successfully",
      });
    } catch (error) {
      console.error("Error processing notes:", error);
      // Show more detailed error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";
        
      // Save error details for display
      setErrorDetails(errorMessage);
      
      // Show API key setup dialog when API key error is detected
      if (errorMessage.includes('API key not valid') || errorMessage.includes('API Key Error')) {
        setShowApiKeyDialog(true);
      }
      
      // Show troubleshooting tips based on error type
      let description = `Failed to analyze: ${errorMessage}`;
      if (errorMessage.includes('API Key Error') || errorMessage.includes('API key not valid')) {
        description += '\nTroubleshooting: Please set up a valid API key.';
      } else if (errorMessage.includes('Network error')) {
        description += '\nTroubleshooting: Please check your internet connection.';
      } else if (errorMessage.includes('JSON parsing')) {
        description += '\nTroubleshooting: The AI response was not in the expected format.';
      }
        
      toast({
        title: "Processing error",
        description: description,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressStage('');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClinicalNotes(text);
      toast({
        description: "Content pasted from clipboard",
      });
    } catch (error) {
      toast({
        title: "Clipboard error",
        description: "Unable to access clipboard. Please paste manually.",
        variant: "destructive"
      });
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          description: "Copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Clipboard error",
          description: "Failed to copy to clipboard",
          variant: "destructive"
        });
      });
  };

  // Function to copy all structured data as formatted text
  const copyAllStructuredData = () => {
    if (!extractedInfo) return;
    
    const formattedText = `
PATIENT INFORMATION:
Name: ${extractedInfo.patient.name || 'N/A'}
DOB: ${extractedInfo.patient.dateOfBirth || 'N/A'}
Gender: ${extractedInfo.patient.gender || 'N/A'}
Contact: ${extractedInfo.patient.contact || 'N/A'}
Email: ${extractedInfo.patient.email || 'N/A'}
Address: ${extractedInfo.patient.address || 'N/A'}
Patient ID: ${extractedInfo.patient.patientId || 'N/A'}
Patient Type: ${extractedInfo.patient.patientType || 'N/A'}

CONSULTATION:
Date/Time: ${extractedInfo.consultation.date || 'N/A'} ${extractedInfo.consultation.time || ''}
Attending Physician: ${extractedInfo.consultation.attendingPhysician || 'N/A'}
Attending Nurse: ${extractedInfo.consultation.attendingNurse || 'N/A'}

CHIEF COMPLAINT: ${extractedInfo.consultation.chiefComplaint}

SUBJECTIVE:
${extractedInfo.consultation.subjective.map(s => `- ${s}`).join('\n')}

OBJECTIVE:
${extractedInfo.consultation.objective.map(o => `- ${o}`).join('\n')}

VITALS:
- BP: ${extractedInfo.consultation.vitals.bloodPressure || 'N/A'}
- HR: ${extractedInfo.consultation.vitals.heartRate || 'N/A'}
- Temp: ${extractedInfo.consultation.vitals.temperature || 'N/A'}
- RR: ${extractedInfo.consultation.vitals.respiratoryRate || 'N/A'}
- SpO2: ${extractedInfo.consultation.vitals.oxygenSaturation || 'N/A'}
- Height: ${extractedInfo.consultation.vitals.height || 'N/A'}
- Weight: ${extractedInfo.consultation.vitals.weight || 'N/A'}

ASSESSMENT:
${extractedInfo.consultation.assessment.diagnoses.map(d => `- ${d.code ? d.code + ': ' : ''}${d.description}`).join('\n')}

PLAN:
${extractedInfo.consultation.plan.map(p => `- ${p}`).join('\n')}

MEDICATIONS:
${extractedInfo.consultation.prescriptions.map(p => `- ${p.drug} ${p.dosage || ''} ${p.form || ''} ${p.frequency || ''} - ${p.instructions || ''}`).join('\n')}

MONITORING:
- BP Monitoring: ${extractedInfo.consultation.bpMonitoring ? 'Yes' : 'No'}
- HbA1c Monitoring: ${extractedInfo.consultation.hba1cMonitoring ? 'Yes' : 'No'}

FOLLOW-UP: ${extractedInfo.consultation.followUpRecommendations || 'N/A'}
`.trim();

    handleCopyToClipboard(formattedText);
  };

  // Add dialog for API key setup
  const openApiKeySetupDialog = () => {
    setShowApiKeyDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center">
            AI Clinical Notes
            <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Beta</Badge>
          </h1>
          <p className="text-sm text-medical-gray mt-1">
            Automatically extract patient information and consultation details from clinical notes
          </p>
        </div>
        
        {extractedInfo && (
          <Button variant="secondary" onClick={copyAllStructuredData} className="gap-2">
            <Clipboard className="h-4 w-4" />
            Copy All Data
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              Clinical Notes
              <Button 
                variant="ghost"
                size="icon"
                onClick={handlePasteFromClipboard}
                className="ml-2 h-7 w-7"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="h-4 w-4" />
                <span className="sr-only">Paste from clipboard</span>
              </Button>
            </CardTitle>
            <CardDescription>
              Enter or paste unstructured clinical notes for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste clinical notes containing patient information (name, DOB, address, etc.) and consultation details..."
              className="min-h-[400px] resize-none font-mono text-sm"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
            />
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Clinical information extraction powered by AI
                </span>
              </div>
              
              <Button 
                onClick={handleProcessNotes}
                disabled={isProcessing || !clinicalNotes.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </div>
            
            {isProcessing && progress > 0 && (
              <div className="mt-2">
                <Progress value={progress} className="h-1" />
                <p className="text-xs text-center mt-1 text-muted-foreground">
                  {progressStage || (
                    progress < 30 ? 'Initializing model...' : 
                     progress < 80 ? 'Analyzing notes...' : 
                     'Formatting results...'
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Extracted Information</CardTitle>
              <CardDescription>
                AI-generated structured data from clinical notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-medical-gray">Analyzing clinical notes...</p>
                  {progress > 0 && (
                    <div className="w-full mt-4 max-w-xs">
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-center mt-1 text-muted-foreground">
                        {progressStage || (
                          progress < 30 ? 'Initializing model...' : 
                          progress < 80 ? 'Analyzing notes...' : 
                          'Formatting results...'
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ) : !extractedInfo ? (
                <Alert>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertTitle>No data</AlertTitle>
                  <AlertDescription>
                    Use the form on the left to analyze clinical notes and generate structured data.
                  </AlertDescription>
                </Alert>
              ) : (
                <Tabs defaultValue="patient" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="patient">Patient</TabsTrigger>
                    <TabsTrigger value="soap">SOAP</TabsTrigger>
                    <TabsTrigger value="vitals">Vitals</TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                  </TabsList>

                  <TabsContent value="patient" className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2 flex items-center gap-2 bg-muted/50 px-4 py-3 rounded-md">
                        <User className="h-5 w-5 text-primary" />
                        <div className="w-full">
                          <Input 
                            className="text-sm font-medium border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                            value={extractedInfo.patient.name || ''}
                            onChange={(e) => setExtractedInfo({
                              ...extractedInfo,
                              patient: {
                                ...extractedInfo.patient,
                                name: e.target.value
                              }
                            })}
                          />
                          <div className="flex gap-2 text-xs text-medical-gray">
                            <span>ID:</span>
                            <Input 
                              className="w-24 border-none bg-transparent h-5 p-0 focus-visible:ring-0"
                              value={extractedInfo.patient.patientId || ''}
                              onChange={(e) => setExtractedInfo({
                                ...extractedInfo,
                                patient: {
                                  ...extractedInfo.patient,
                                  patientId: e.target.value
                                }
                              })}
                            />
                            <span>Type:</span>
                            <Select
                              value={extractedInfo.patient.patientType || ''}
                              onValueChange={(value) => setExtractedInfo({
                                ...extractedInfo,
                                patient: {
                                  ...extractedInfo.patient,
                                  patientType: value
                                }
                              })}
                            >
                              <SelectTrigger className="border-none h-5 text-xs w-24 p-0 pl-1 focus:ring-0">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="follow_up">Follow-up</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                                <SelectItem value="chronic">Chronic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 px-3 py-2 rounded-md">
                        <p className="text-xs text-medical-gray">Date of Birth</p>
                        <Input 
                          className="text-sm border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                          value={extractedInfo.patient.dateOfBirth || ''}
                          onChange={(e) => setExtractedInfo({
                            ...extractedInfo,
                            patient: {
                              ...extractedInfo.patient,
                              dateOfBirth: e.target.value
                            }
                          })}
                        />
                      </div>
                      
                      <div className="bg-muted/50 px-3 py-2 rounded-md">
                        <p className="text-xs text-medical-gray">Age / Gender</p>
                        <div className="flex gap-2">
                          <Input 
                            className="text-sm border-none bg-transparent h-7 p-0 focus-visible:ring-0 w-12"
                            value={extractedInfo.patient.age || ''}
                            type="number"
                            onChange={(e) => setExtractedInfo({
                              ...extractedInfo,
                              patient: {
                                ...extractedInfo.patient,
                                age: e.target.value ? parseInt(e.target.value) : undefined
                              }
                            })}
                          />
                          <span className="text-sm">yrs /</span>
                          <Input 
                            className="text-sm border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                            value={extractedInfo.patient.gender || ''}
                            onChange={(e) => setExtractedInfo({
                              ...extractedInfo,
                              patient: {
                                ...extractedInfo.patient,
                                gender: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 px-3 py-2 rounded-md">
                        <p className="text-xs text-medical-gray">Contact</p>
                        <Input 
                          className="text-sm border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                          value={extractedInfo.patient.contact || ''}
                          onChange={(e) => setExtractedInfo({
                            ...extractedInfo,
                            patient: {
                              ...extractedInfo.patient,
                              contact: e.target.value
                            }
                          })}
                        />
                      </div>
                      
                      <div className="bg-muted/50 px-3 py-2 rounded-md">
                        <p className="text-xs text-medical-gray">Email</p>
                        <Input 
                          className="text-sm border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                          value={extractedInfo.patient.email || ''}
                          onChange={(e) => setExtractedInfo({
                            ...extractedInfo,
                            patient: {
                              ...extractedInfo.patient,
                              email: e.target.value
                            }
                          })}
                        />
                      </div>
                      
                      <div className="col-span-2 bg-muted/50 px-3 py-2 rounded-md">
                        <p className="text-xs text-medical-gray">Address</p>
                        <Input 
                          className="text-sm border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                          value={extractedInfo.patient.address || ''}
                          onChange={(e) => setExtractedInfo({
                            ...extractedInfo,
                            patient: {
                              ...extractedInfo.patient,
                              address: e.target.value
                            }
                          })}
                        />
                      </div>
                      
                      <div className="bg-muted/50 px-3 py-2 rounded-md">
                        <p className="text-xs text-medical-gray">Attending Physician</p>
                        <Input 
                          className="text-sm border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                          value={extractedInfo.consultation.attendingPhysician || ''}
                          onChange={(e) => setExtractedInfo({
                            ...extractedInfo,
                            consultation: {
                              ...extractedInfo.consultation,
                              attendingPhysician: e.target.value
                            }
                          })}
                        />
                      </div>
                      
                      <div className="bg-muted/50 px-3 py-2 rounded-md">
                        <p className="text-xs text-medical-gray">Attending Nurse</p>
                        <Input 
                          className="text-sm border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                          value={extractedInfo.consultation.attendingNurse || ''}
                          onChange={(e) => setExtractedInfo({
                            ...extractedInfo,
                            consultation: {
                              ...extractedInfo.consultation,
                              attendingNurse: e.target.value
                            }
                          })}
                        />
                      </div>
                      
                      <div className="bg-muted/50 px-3 py-2 rounded-md">
                        <p className="text-xs text-medical-gray">Date</p>
                        <Input 
                          className="text-sm border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                          value={extractedInfo.consultation.date || ''}
                          onChange={(e) => setExtractedInfo({
                            ...extractedInfo,
                            consultation: {
                              ...extractedInfo.consultation,
                              date: e.target.value
                            }
                          })}
                        />
                      </div>
                      
                      <div className="bg-muted/50 px-3 py-2 rounded-md">
                        <p className="text-xs text-medical-gray">Time</p>
                        <Input 
                          className="text-sm border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                          value={extractedInfo.consultation.time || ''}
                          onChange={(e) => setExtractedInfo({
                            ...extractedInfo,
                            consultation: {
                              ...extractedInfo.consultation,
                              time: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleCopyToClipboard(`
Patient Name: ${extractedInfo.patient.name}
DOB: ${extractedInfo.patient.dateOfBirth}
Age: ${extractedInfo.patient.age}
Gender: ${extractedInfo.patient.gender}
Contact: ${extractedInfo.patient.contact}
Email: ${extractedInfo.patient.email}
Address: ${extractedInfo.patient.address}
ID: ${extractedInfo.patient.patientId}
                        `.trim())}
                      >
                        <Clipboard className="h-3 w-3 mr-1" />
                        Copy Patient Info
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="soap" className="space-y-4">
                    <Accordion type="multiple" defaultValue={["subjective", "objective", "assessment", "plan"]}>
                      <AccordionItem value="subjective">
                        <AccordionTrigger className="text-sm font-medium">
                          Subjective (S)
                          <div className="ml-auto mr-4">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                              e.stopPropagation();
                              handleCopyToClipboard(extractedInfo.consultation.subjective.join('\n'));
                            }}>
                              <Clipboard className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="ml-1 mt-2 mb-1 space-y-1">
                            <div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium">Chief Complaint:</span>
                              </div>
                              <Textarea 
                                className="mt-1 text-sm bg-muted/50 px-3 py-2 rounded-md resize-none min-h-[70px]"
                                value={extractedInfo.consultation.chiefComplaint}
                                onChange={(e) => setExtractedInfo({
                                  ...extractedInfo,
                                  consultation: {
                                    ...extractedInfo.consultation,
                                    chiefComplaint: e.target.value
                                  }
                                })}
                              />
                            </div>
                            
                            <div className="mt-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">History:</span>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5" 
                                  onClick={() => {
                                    setExtractedInfo({
                                      ...extractedInfo,
                                      consultation: {
                                        ...extractedInfo.consultation,
                                        subjective: [...extractedInfo.consultation.subjective, '']
                                      }
                                    });
                                  }}
                                >
                                  <span className="sr-only">Add item</span>
                                  +
                                </Button>
                              </div>
                              <ul className="mt-1 space-y-1">
                                {extractedInfo.consultation.subjective.map((item, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <Input 
                                      className="text-sm bg-muted/50 px-3 py-1.5 rounded-md flex-1"
                                      value={item}
                                      onChange={(e) => {
                                        const newSubjective = [...extractedInfo.consultation.subjective];
                                        newSubjective[index] = e.target.value;
                                        setExtractedInfo({
                                          ...extractedInfo,
                                          consultation: {
                                            ...extractedInfo.consultation,
                                            subjective: newSubjective
                                          }
                                        });
                                      }}
                                    />
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 text-red-500" 
                                      onClick={() => {
                                        const newSubjective = [...extractedInfo.consultation.subjective];
                                        newSubjective.splice(index, 1);
                                        setExtractedInfo({
                                          ...extractedInfo,
                                          consultation: {
                                            ...extractedInfo.consultation,
                                            subjective: newSubjective
                                          }
                                        });
                                      }}
                                    >
                                      <span className="sr-only">Remove item</span>
                                      ×
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="objective">
                        <AccordionTrigger className="text-sm font-medium">
                          Objective (O)
                          <div className="ml-auto mr-4">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                              e.stopPropagation();
                              handleCopyToClipboard(extractedInfo.consultation.objective.join('\n'));
                            }}>
                              <Clipboard className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Examination:</span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5" 
                              onClick={() => {
                                setExtractedInfo({
                                  ...extractedInfo,
                                  consultation: {
                                    ...extractedInfo.consultation,
                                    objective: [...extractedInfo.consultation.objective, '']
                                  }
                                });
                              }}
                            >
                              <span className="sr-only">Add item</span>
                              +
                            </Button>
                          </div>
                          <ul className="ml-1 mb-1 space-y-1">
                            {extractedInfo.consultation.objective.map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Input
                                  className="text-sm bg-muted/50 px-3 py-1.5 rounded-md flex-1"
                                  value={item}
                                  onChange={(e) => {
                                    const newObjective = [...extractedInfo.consultation.objective];
                                    newObjective[index] = e.target.value;
                                    setExtractedInfo({
                                      ...extractedInfo,
                                      consultation: {
                                        ...extractedInfo.consultation,
                                        objective: newObjective
                                      }
                                    });
                                  }}
                                />
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-red-500" 
                                  onClick={() => {
                                    const newObjective = [...extractedInfo.consultation.objective];
                                    newObjective.splice(index, 1);
                                    setExtractedInfo({
                                      ...extractedInfo,
                                      consultation: {
                                        ...extractedInfo.consultation,
                                        objective: newObjective
                                      }
                                    });
                                  }}
                                >
                                  <span className="sr-only">Remove item</span>
                                  ×
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="assessment">
                        <AccordionTrigger className="text-sm font-medium">
                          Assessment (A)
                          <div className="ml-auto mr-4">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                              e.stopPropagation();
                              handleCopyToClipboard(extractedInfo.consultation.assessment.diagnoses.map(d => 
                                `${d.code ? d.code + ': ' : ''}${d.description}`
                              ).join('\n'));
                            }}>
                              <Clipboard className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="ml-1 mt-2 mb-1 space-y-1">
                            {extractedInfo.consultation.assessment.diagnoses.map((diagnosis, index) => (
                              <li key={index} className="text-sm bg-muted/50 px-3 py-1.5 rounded-md flex items-center">
                                {diagnosis.code && (
                                  <Badge variant="outline" className="mr-2 font-mono">
                                    {diagnosis.code}
                                  </Badge>
                                )}
                                <span>{diagnosis.description}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="plan">
                        <AccordionTrigger className="text-sm font-medium">
                          Plan (P)
                          <div className="ml-auto mr-4">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                              e.stopPropagation();
                              handleCopyToClipboard(extractedInfo.consultation.plan.join('\n'));
                            }}>
                              <Clipboard className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="ml-1 mt-2 mb-1 space-y-1">
                            {extractedInfo.consultation.plan.map((item, index) => (
                              <li key={index} className="text-sm bg-muted/50 px-3 py-1.5 rounded-md">{item}</li>
                            ))}
                          </ul>
                          
                          <div className="ml-1 mt-3 space-y-1">
                            <div className="flex items-center">
                              <span className="text-sm font-medium">Monitoring:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {extractedInfo.consultation.bpMonitoring && (
                                <Badge variant="outline">BP Monitoring</Badge>
                              )}
                              {extractedInfo.consultation.hba1cMonitoring && (
                                <Badge variant="outline">HbA1c Monitoring</Badge>
                              )}
                            </div>
                          </div>
                          
                          {extractedInfo.consultation.followUpRecommendations && (
                            <div className="mt-3">
                              <div className="flex items-center mt-2">
                                <span className="text-sm font-medium">Follow-up:</span>
                              </div>
                              <p className="mt-1 text-sm bg-muted/50 px-3 py-2 rounded-md">{extractedInfo.consultation.followUpRecommendations}</p>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TabsContent>

                  <TabsContent value="vitals" className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {extractedInfo.consultation.vitals.bloodPressure && (
                        <div className="flex justify-between items-center bg-muted/50 px-3 py-2 rounded-md">
                          <div className="w-full">
                            <p className="text-xs text-medical-gray">Blood Pressure</p>
                            <Input 
                              className="text-sm font-medium border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                              value={extractedInfo.consultation.vitals.bloodPressure || ''}
                              onChange={(e) => setExtractedInfo({
                                ...extractedInfo,
                                consultation: {
                                  ...extractedInfo.consultation,
                                  vitals: {
                                    ...extractedInfo.consultation.vitals,
                                    bloodPressure: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                          <Badge variant={parseInt(extractedInfo.consultation.vitals.bloodPressure) > 140 ? "destructive" : "outline"} className="text-xs">
                            {parseInt(extractedInfo.consultation.vitals.bloodPressure) > 140 ? "High" : "Normal"}
                          </Badge>
                        </div>
                      )}
                      
                      {extractedInfo.consultation.vitals.heartRate && (
                        <div className="flex justify-between items-center bg-muted/50 px-3 py-2 rounded-md">
                          <div className="w-full">
                            <p className="text-xs text-medical-gray">Heart Rate</p>
                            <Input 
                              className="text-sm font-medium border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                              value={extractedInfo.consultation.vitals.heartRate || ''}
                              onChange={(e) => setExtractedInfo({
                                ...extractedInfo,
                                consultation: {
                                  ...extractedInfo.consultation,
                                  vitals: {
                                    ...extractedInfo.consultation.vitals,
                                    heartRate: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                          <Badge variant="outline" className="text-xs">Normal</Badge>
                        </div>
                      )}
                      
                      {extractedInfo.consultation.vitals.temperature && (
                        <div className="flex justify-between items-center bg-muted/50 px-3 py-2 rounded-md">
                          <div className="w-full">
                            <p className="text-xs text-medical-gray">Temperature</p>
                            <Input 
                              className="text-sm font-medium border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                              value={extractedInfo.consultation.vitals.temperature || ''}
                              onChange={(e) => setExtractedInfo({
                                ...extractedInfo,
                                consultation: {
                                  ...extractedInfo.consultation,
                                  vitals: {
                                    ...extractedInfo.consultation.vitals,
                                    temperature: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                          <Badge variant="outline" className="text-xs">Normal</Badge>
                        </div>
                      )}
                      
                      {extractedInfo.consultation.vitals.respiratoryRate && (
                        <div className="flex justify-between items-center bg-muted/50 px-3 py-2 rounded-md">
                          <div className="w-full">
                            <p className="text-xs text-medical-gray">Respiratory Rate</p>
                            <Input 
                              className="text-sm font-medium border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                              value={extractedInfo.consultation.vitals.respiratoryRate || ''}
                              onChange={(e) => setExtractedInfo({
                                ...extractedInfo,
                                consultation: {
                                  ...extractedInfo.consultation,
                                  vitals: {
                                    ...extractedInfo.consultation.vitals,
                                    respiratoryRate: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                          <Badge variant="outline" className="text-xs">Normal</Badge>
                        </div>
                      )}
                      
                      {extractedInfo.consultation.vitals.oxygenSaturation && (
                        <div className="flex justify-between items-center bg-muted/50 px-3 py-2 rounded-md">
                          <div className="w-full">
                            <p className="text-xs text-medical-gray">O₂ Saturation</p>
                            <Input 
                              className="text-sm font-medium border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                              value={extractedInfo.consultation.vitals.oxygenSaturation || ''}
                              onChange={(e) => setExtractedInfo({
                                ...extractedInfo,
                                consultation: {
                                  ...extractedInfo.consultation,
                                  vitals: {
                                    ...extractedInfo.consultation.vitals,
                                    oxygenSaturation: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                          <Badge variant="outline" className="text-xs">Normal</Badge>
                        </div>
                      )}
                      
                      {extractedInfo.consultation.vitals.height && (
                        <div className="flex justify-between items-center bg-muted/50 px-3 py-2 rounded-md">
                          <div className="w-full">
                            <p className="text-xs text-medical-gray">Height</p>
                            <Input 
                              className="text-sm font-medium border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                              value={extractedInfo.consultation.vitals.height || ''}
                              onChange={(e) => setExtractedInfo({
                                ...extractedInfo,
                                consultation: {
                                  ...extractedInfo.consultation,
                                  vitals: {
                                    ...extractedInfo.consultation.vitals,
                                    height: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                        </div>
                      )}
                      
                      {extractedInfo.consultation.vitals.weight && (
                        <div className="flex justify-between items-center bg-muted/50 px-3 py-2 rounded-md">
                          <div className="w-full">
                            <p className="text-xs text-medical-gray">Weight</p>
                            <Input 
                              className="text-sm font-medium border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                              value={extractedInfo.consultation.vitals.weight || ''}
                              onChange={(e) => setExtractedInfo({
                                ...extractedInfo,
                                consultation: {
                                  ...extractedInfo.consultation,
                                  vitals: {
                                    ...extractedInfo.consultation.vitals,
                                    weight: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs mt-2"
                      onClick={() => handleCopyToClipboard(`
BP: ${extractedInfo.consultation.vitals.bloodPressure || 'N/A'}
HR: ${extractedInfo.consultation.vitals.heartRate || 'N/A'}
Temp: ${extractedInfo.consultation.vitals.temperature || 'N/A'}
RR: ${extractedInfo.consultation.vitals.respiratoryRate || 'N/A'}
SpO2: ${extractedInfo.consultation.vitals.oxygenSaturation || 'N/A'}
Height: ${extractedInfo.consultation.vitals.height || 'N/A'}
Weight: ${extractedInfo.consultation.vitals.weight || 'N/A'}
                      `.trim())}
                    >
                      <Clipboard className="h-3 w-3 mr-1" />
                      Copy Vitals
                    </Button>
                  </TabsContent>

                  <TabsContent value="medications" className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium flex items-center justify-between">
                        Prescribed Medications
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => 
                          handleCopyToClipboard(extractedInfo.consultation.prescriptions.map(p => 
                            `${p.drug} ${p.dosage || ''} ${p.form || ''} ${p.frequency || ''} - ${p.instructions || ''}`
                          ).join('\n'))
                        }>
                          <Clipboard className="h-3.5 w-3.5" />
                        </Button>
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {extractedInfo.consultation.prescriptions.map((prescription, index) => (
                          <li key={index} className="p-3 bg-muted/50 rounded-md">
                            <div className="flex justify-between">
                              <h4 className="text-sm font-medium">{prescription.drug} {prescription.dosage} {prescription.form}</h4>
                            </div>
                            <p className="text-xs text-medical-gray mt-1">
                              {prescription.frequency}{prescription.duration ? `, ${prescription.duration}` : ''}
                            </p>
                            {prescription.instructions && (
                              <p className="text-xs mt-1 text-medical-gray italic">
                                Instructions: {prescription.instructions}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
          
          {extractedInfo && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Create Patient Record
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Create Consultation
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Export as PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            About AI Clinical Notes
            <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Beta</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-medical-gray">
            <p>This AI-powered feature extracts patient information and consultation details from clinical notes to save time and automate data entry.</p>
            <p><strong>How to use:</strong> Paste clinical notes in the text area, then click "Analyze with AI" to automatically extract:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Patient demographic information (name, DOB, contact details)</li>
              <li>Patient address and identifiers</li>
              <li>Consultation details in SOAP format</li>
              <li>Vital sign measurements with interpretation</li>
              <li>Assessment with ICD-10 coded diagnoses</li>
              <li>Treatment plan and prescribed medications</li>
            </ul>
            <div className="bg-blue-50 p-3 rounded-md mt-3">
              <p className="font-medium text-blue-800">Key Benefits:</p>
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li>Advanced medical knowledge for accurate information extraction</li>
                <li>Better at complex clinical text analysis</li>
                <li>Excellent at identifying ICD-10 codes</li>
                <li>Fast response times with optimized inference</li>
                <li>Improved accuracy for structured data extraction</li>
              </ul>
            </div>
            <p><strong>Note:</strong> This feature is in beta. Always verify the extracted information for accuracy before using in official medical records.</p>
          </div>
        </CardContent>
      </Card>

      {/* Debugging Tools */}
      <Accordion type="single" collapsible className="mt-4">
        <AccordionItem value="debug">
          <AccordionTrigger className="text-sm font-medium">Troubleshooting Tools</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-xs">
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testApiConnection}
                  className="w-full justify-start"
                >
                  {apiStatus === 'unknown' && 'Test API Connection'}
                  {apiStatus === 'ok' && <span className="text-green-500 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" />API Connection OK</span>}
                  {apiStatus === 'error' && <span className="text-red-500 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />API Connection Failed</span>}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openApiKeySetupDialog}
                  className="w-full justify-start"
                >
                  <Key className="h-3 w-3 mr-1" />
                  API Key Setup Instructions
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadSampleNotes}
                  className="w-full justify-start"
                >
                  Load Sample Notes
                </Button>
                
                <div className="flex items-center mt-1">
                  <input 
                    type="checkbox" 
                    id="advanced-error-toggle" 
                    className="h-3 w-3 mr-1" 
                    checked={simulateError} 
                    onChange={() => setSimulateError(prev => !prev)}
                  />
                  <label htmlFor="advanced-error-toggle" className="text-xs text-red-500">
                    Simulate Error (for testing)
                  </label>
                </div>
              </div>
              
              {errorDetails && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800">
                  <p className="font-medium">Error Details:</p>
                  <pre className="mt-1 text-xs whitespace-pre-wrap">{errorDetails}</pre>
                </div>
              )}
              
              <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                <p className="font-medium">Troubleshooting Tips:</p>
                <ul className="mt-1 list-disc pl-4">
                  <li>Ensure you have a valid API key configured</li>
                  <li>Check your internet connection</li>
                  <li>Make sure the clinical notes contain actual medical information</li>
                  <li>Try with a shorter sample of clinical notes first</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* API Key Setup Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Set Up Google Gemini API Key</DialogTitle>
            <DialogDescription>
              You need a valid Google Gemini API key to use this feature.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">How to get an API key:</h3>
              <ol className="text-sm list-decimal pl-5 space-y-1">
                <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
                <li>Sign in with your Google account</li>
                <li>Click on "Get API key" or create a new API key</li>
                <li>Copy your API key</li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">How to set up your API key:</h3>
              <p className="text-sm">Create a <code className="bg-gray-100 p-1 rounded">.env</code> file in the project root with:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs">
                VITE_GEMINI_API_KEY=your_actual_api_key_here
              </pre>
              <p className="text-sm">Then restart your development server.</p>
            </div>
            
            <div className="bg-amber-50 p-3 rounded">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> Keep your API key secure and never share it publicly. 
                For production environments, use server-side API key management.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowApiKeyDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AINotes; 