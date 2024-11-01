"use client"

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import './styles/styles.css';
import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Button,
  IconButton,
  Alert,
  Tooltip,
  Avatar,
  Chip,
  TextField
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  AttachFileSharp as AttachFileSharpIcon,
  SaveAltSharp as SaveAltSharpIcon,
  TipsAndUpdates as TipsAndUpdatesIcon,
  VolumeUp as VolumeUpIcon,
  KeyboardVoice as KeyboardVoiceIcon,
  CancelOutlined as CancelOutlinedIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import Image from 'next/image';

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string; type?: string; files?: File[]; likeStatus?: 'Good' | 'Bad' | null; feedback?: string | null }[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [tooltipText, setTooltipText] = useState<Record<string, unknown>>({});
  const [suggestQuestions, setSuggestQuestions] = useState<boolean>(false);
  const [suggestQuestionsVisible, setSuggestQuestionsVisible] = useState<boolean>(true);
  const [userSuggestQuestions, setUserSuggestQuestions] = useState<string[]>([]);
  const [isAssistantResponding, setIsAssistantResponding] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioResponse, setAudioResponse] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('sr');
  const [showTypingIndicator, setShowTypingIndicator] = useState<boolean>(false);
  const [openSpeedDial, setOpenSpeedDial] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [likeStatus, setLikeStatus] = useState<'Good' | 'Bad' | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState<boolean>(false);
  const [backgroundColor] = useState(process.env.NEXT_PUBLIC_PRIMARY_BG_COLOR || '#3d3d3d');
  const [backgroundImage] = useState(process.env.NEXT_PUBLIC_BACKGROUND_IMAGE || '');
  const [avatarImage] = useState(process.env.NEXT_PUBLIC_AVATAR_IMAGE);
  const [fontColor] = useState(process.env.NEXT_PUBLIC_PRIMARY_FONT_COLOR);
  const [userBackgroundColor] = useState(process.env.NEXT_PUBLIC_USER_BG_COLOR);
  const [assistantBackgroundColor] = useState(process.env.NEXT_PUBLIC_ASSISTANT_BG_COLOR);
  const [inputRowColor] = useState(process.env.NEXT_PUBLIC_PRIMARY_INPUTROW_COLOR);
  const [sendButtonColor] = useState(process.env.NEXT_PUBLIC_PRIMARY_SENDBUTTON_COLOR);
  const [customLinkColor] = useState(process.env.NEXT_PUBLIC_CUSTOM_LINK_COLOR);
  const [baseUrl] = useState(process.env.NEXT_PUBLIC_AXIOS_URL || "http://localhost:8000");
  const [backgroundStartRgb] = useState(hexToRgb(backgroundColor));
  const [backgroundEndRgb] = useState(hexToRgb(backgroundColor));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [userScrolled, setUserScrolled] = useState<boolean>(false);
  const [deleteIconVisible] = useState(process.env.NEXT_PUBLIC_SHOW_DELETE_ICON === 'true' || true);
  const [attachFileIconVisible] = useState(process.env.NEXT_PUBLIC_SHOW_ATTACH_FILE_ICON === 'true');
  const [saveIconVisible] = useState(process.env.NEXT_PUBLIC_SHOW_SAVE_ICON === 'true');
  const [suggestQuestionsIconVisible] = useState(process.env.NEXT_PUBLIC_SHOW_SUGGEST_QUESTIONS_ICON === 'true');
  const [audioResponseIconVisible] = useState(process.env.NEXT_PUBLIC_SHOW_AUDIO_RESPONSE_ICON === 'true');
  const [initialQuestionsVisible, setInitialQuestionsVisible] = useState(process.env.NEXT_PUBLIC_SHOW_INITIAL_QUESTIONS === 'true');
  const [initialFirstQuestion] = useState(process.env.NEXT_PUBLIC_INITIAL_QUESTION_1 || '');
  const [initialSecondQuestion] = useState(process.env.NEXT_PUBLIC_INITIAL_QUESTION_2 || '');
  const [initialFirstQuestionEng] = useState(process.env.NEXT_PUBLIC_INITIAL_QUESTION_ENG_1 || '');
  const [initialSecondQuestionEng] = useState(process.env.NEXT_PUBLIC_INITIAL_QUESTION_ENG_2 || '');
  const [feedbackIconVisible] = useState(process.env.NEXT_PUBLIC_SHOW_FEEDBACK === 'true');
  const [voiceRecordIconVisible] = useState(process.env.NEXT_PUBLIC_SHOW_VOICE_RECORD_ICON === 'true');
  const [showInitialMessages] = useState<boolean>(process.env.NEXT_PUBLIC_SHOW_INITIAL_ASSISTANT_MESSAGES === 'true');
  const [initialAssistantMessagesArray] = useState<string[]>(JSON.parse(process.env.NEXT_PUBLIC_INITIAL_ASSISTANT_MESSAGES || '[]'));
  const [initialAssistantMessagesArrayEng] = useState<string[]>(JSON.parse(process.env.NEXT_PUBLIC_INITIAL_ASSISTANT_MESSAGES_ENG || '[]'));
  const [orderMessage, setOrderMessage] = useState<boolean>(false);
  const [liveChatAllowed] = useState(process.env.NEXT_PUBLIC_LIVE_CHAT_ALLOWED === 'true' || false);
  const [liveChatButtonVisible, setLiveChatButtonVisible] = useState(false);
  const [liveChatOpen, setLiveChatOpen] = useState(false);

  function hexToRgb(hex: any) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }
   
  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--background-start-default', backgroundStartRgb, 'important');
    document.documentElement.style.setProperty('--background-end-default', backgroundEndRgb, 'important');
  }, [backgroundStartRgb, backgroundEndRgb]);

  useEffect(() => {
    if (backgroundColor) {
      document.documentElement.style.setProperty('--primary-bg-color', backgroundColor);
    }
    if (fontColor) {
      document.documentElement.style.setProperty('--primary-font-color', fontColor);
    }
    if (userBackgroundColor) {
      document.documentElement.style.setProperty('--user-bg-color', userBackgroundColor);
    }
    if (assistantBackgroundColor) {
      document.documentElement.style.setProperty('--assistant-bg-color', assistantBackgroundColor);
    }
    if (backgroundImage) {
      document.documentElement.style.setProperty('--background-image', `url(${backgroundImage})`);
    }
    if (inputRowColor) {
      document.documentElement.style.setProperty('--primary-inputrow-color', inputRowColor);
    }
    if (sendButtonColor) {
      document.documentElement.style.setProperty('--primary-sendbutton-color', sendButtonColor);
    }
    if (customLinkColor) {
      document.documentElement.style.setProperty('--custom-link-color', customLinkColor);
    }

  }, [backgroundColor, fontColor, userBackgroundColor, assistantBackgroundColor, backgroundImage, inputRowColor, sendButtonColor ]);
 

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      sessionStorage.setItem('sessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("Novi event:", event)
      if (event.data.type === 'main-url') {
        const path = event.data.url;
        const url = new URL(path);
        const isEnglish = url.pathname.includes('/en/') || url.pathname.endsWith('/en') || url.hash.includes('/en') || url.search.includes('lang=en');
        setLanguage(isEnglish ? 'en' : 'sr');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    if (showInitialMessages && initialAssistantMessagesArray.length > 0) {
      const selectedMessagesArray = language === 'en' ? initialAssistantMessagesArrayEng : initialAssistantMessagesArray;

      if (selectedMessagesArray.length > 0) {
        const assistantMessages = selectedMessagesArray.map((messageContent) => ({
          role: 'assistant',
          content: messageContent,
        }));
  
        setMessages(assistantMessages);
      }
    }
  }, [showInitialMessages, language, initialAssistantMessagesArray, initialAssistantMessagesArrayEng]);

  useEffect(() => {
    localStorage.setItem('language', language);
    console.log("local storage", localStorage);
    console.log('Language:', language);
  }, [language]);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    console.log("stored language", storedLanguage)
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('language');
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleScroll = () => {
    if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollHeight - scrollTop > clientHeight + 50) {
            setUserScrolled(true);
        }
      }
  };

  const scrollToBottom = useCallback(() => {
      if (!userScrolled && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
  }, [userScrolled]);

  useEffect(() => {
      scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
      const currentContainer = containerRef.current;
      currentContainer?.addEventListener('scroll', handleScroll);
      return () => {
          currentContainer?.removeEventListener('scroll', handleScroll);
      };
  }, []);

  const handleToggle = () => {
    setOpenSpeedDial(!openSpeedDial);
    setInitialQuestionsVisible(openSpeedDial);
    setSuggestQuestionsVisible(openSpeedDial);
  };

  const handleActionClick = (actionOnClick: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    actionOnClick();
  };

  const handleAudioUpload = async (blob: any) => {
    const formData = new FormData();
    formData.append('blob', blob, 'blob.mp4');
    formData.append('session_id', sessionId);

    try {
      const response = await axios.post(`${baseUrl}/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Session-ID': sessionId
        }
      });
      const { transcript } = response.data;
      setUserMessage(transcript);
      setIsRecording(false);
    } catch (error) {
      console.log(error);
      setIsRecording(false);
    }
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/mp4' });
        let silenceTimeout: NodeJS.Timeout;
        let chunks: Blob[] = [];

        const resetSilenceTimeout = () => {
          clearTimeout(silenceTimeout);
          silenceTimeout = setTimeout(() => {
            mediaRecorderRef.current?.stop();
          }, 5000);
        };

        mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
          chunks.push(event.data);
        };

        mediaRecorderRef.current.onstart = () => {
          resetSilenceTimeout();
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/mp4' });
          handleAudioUpload(blob);
          chunks = [];
          clearTimeout(silenceTimeout);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);

        const audioContext = new (window.AudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 2048;
        const dataArray = new Uint8Array(analyser.fftSize);

        const detectSilence = () => {
          analyser.getByteTimeDomainData(dataArray);
          const isSilent = dataArray.every(value => value === 128);
          if (!isSilent) {
            resetSilenceTimeout();
          }
          if (isRecording) {
            requestAnimationFrame(detectSilence);
          }
        };

        detectSilence();
      }).catch(() => {
        setIsRecording(false);
      });
    }
  };

  const handleAudioResponse = (audioBase64: string): void => {
    if (audioResponse) {
      setAudioBase64(audioBase64);
      const audio: HTMLAudioElement = new Audio(`data:audio/mp4;base64,${audioBase64}`);
      audioRef.current = audio;
    }
  };

  const fetchSuggestedQuestions = async () => {
    try {
      const response = await axios.get(`${baseUrl}/suggest-questions`);
      const data = response.data;
      if (data.suggested_questions) {
        setUserSuggestQuestions(data.suggested_questions.filter((q: string) => q.trim() !== ''));
      } else {
        setUserSuggestQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggested questions:', error);
    }
  };

  const getEventSource = () => {
    setIsAssistantResponding(true);
    const eventSource = new EventSource(`${baseUrl}/chat/stream?session_id=${sessionId}`, {
      withCredentials: true
    });

    eventSource.onopen = () => {
      console.log("EventSource connection opened.");
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const content = data.content;

      if (data.audio) {
        handleAudioResponse(data.audio);
      }

      updateLastMessage({ role: 'assistant', content: content });

      if (!content.endsWith('▌')) {
        eventSource.close();
        updateLastMessage({ role: 'assistant', content: content.replace('▌', '') });
        setIsAssistantResponding(false);
        if (suggestQuestions) 
          fetchSuggestedQuestions();
      }
    };

    eventSource.onerror = (event) => {
      console.error("EventSource failed.", event);
      eventSource.close();
      setIsAssistantResponding(false);
    };
  };

  const handleClearChat = () => {
    setMessages([]);
    sessionStorage.removeItem('sessionId');
    const newSessionId = uuidv4();
    sessionStorage.setItem('sessionId', newSessionId);
    setSessionId(newSessionId);
    setFiles([]);
    setUserSuggestQuestions([]);
    setAudioBase64(null);
    setSuggestQuestions(false);
    setAudioResponse(false);
  };

  const handleSuggestQuestions = () => {
    setSuggestQuestions(!suggestQuestions);
  };

  const handleAudioResponseClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioResponse === false) {
      setAudioBase64(null);
    }
    setAudioResponse(!audioResponse);
  };

  const getFileTypeIcon = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isImage = file.type.startsWith('image/');
  
    if (isImage) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
        />
      );
    }
  
    switch (fileExtension) {
      case 'pdf':
        return <Image src="/icons/pdf-icon.png" alt="PDF" width={24} height={24} />;
      case 'doc':
      case 'docx':
        return <Image src="/icons/doc-icon.png" alt="Document" width={24} height={24} />;
      default:
        return <Image src="/icons/default-icon.png" alt="File" width={24} height={24} />;
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>, message?: string): Promise<void> => {
    if (e) e.preventDefault();

    const finalMessage = message || userMessage.trim();

    if (!finalMessage) {
      return; // Do nothing if the message is empty
    }

    setInitialQuestionsVisible(false);
    handleToggle();

    const newMessage: { role: string; content: string } = {
      role: 'user',
      content: finalMessage
    };
    setLikeStatus(null);
    setFeedbackVisible(false);
    setUserMessage(''); 
    setFiles([]);

    setMessages((prevMessages: { role: string; content: string; type?: string }[]) => [...prevMessages, newMessage]);
    setShowTypingIndicator(true);

    const textareaElement = document.querySelector('.expanding-textarea') as HTMLTextAreaElement;
    if (textareaElement) {
        textareaElement.style.height = '40px';
    }

    try {
      let response: AxiosResponse<any, any>;
      let orderMess: any;
      let assistantMessage: { role: string; content: string; files: File[] } | undefined;

      if(orderMessage) { 
        orderMess = `Koji je status moje porudžbine broj ${newMessage.content}`;
        assistantMessage = {
          role: 'user',
          content: orderMess,
          files: files,
        };
      }

      const messageToSend = orderMessage && assistantMessage ? (setOrderMessage(false), assistantMessage) : newMessage;
 
      response = await axios.post(`${baseUrl}/chat`,
        {
          message: messageToSend,
          suggest_questions: suggestQuestions,
          play_audio_response: audioResponse,
          language: language,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Session-ID': sessionId,
          },
          withCredentials: true,
        }
      );

      const data: { calendly?: string; suggested_questions?: string[] } = response.data;

      if (data && data.calendly) {
        setMessages((prevMessages: { role: string; content: string; type?: string }[]) => [
          ...prevMessages,
          { role: 'assistant', content: data.calendly ?? '', type: 'text' },
        ]);
        setShowTypingIndicator(false);
      } else {
        getEventSource();
      }

      if (data.suggested_questions) {
        setUserSuggestQuestions(data.suggested_questions.filter((q: string) => q.trim() !== ''));
      } else {
        setUserSuggestQuestions([]);
      }
    } catch (error: unknown) {
      console.error('Network or Server Error:', error);
    }
  };

  useEffect(() => {
    const handleIncomingMessage = (event: MessageEvent) => {
        if (event.data.type === 'SEND_MESSAGE' && event.data.message) {
            handleSubmit(event.data.message);
        }
    };

    window.addEventListener('message', handleIncomingMessage);

    return () => {
        window.removeEventListener('message', handleIncomingMessage);
    };
}, [handleSubmit]);

  const handleDownloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSuggestedQuestionClick = async (question: any) => {
    if (question == 'Koji je status moje porudžbine?') {
      setOrderMessage(true);
      let mess = 'Pošaljite mi broj porudžbine';
      const newMessage: { role: string; content: string; files: File[] } = {
        role: 'user',
        content: question,
        files: files,
      };

      setMessages((prevMessages: { role: string; content: string; type?: string }[]) => [
        ...prevMessages,
        newMessage,
      ]);
  
      setShowTypingIndicator(true);
  
      setTimeout(() => {
        setShowTypingIndicator(false);
        const assistantMess: { role: string; content: string; files: File[] } = {
          role: 'assistant',
          content: mess,
          files: files,
        };
  
        setMessages((prevMessages: { role: string; content: string; type?: string }[]) => [
          ...prevMessages,
          assistantMess,
        ]);
      }, 2000);
      return; 
    }
    const newMessage = {
      role: 'user',
      content: question
    };
  
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setShowTypingIndicator(true);
    setUserSuggestQuestions([]);
    if(liveChatAllowed)
      setLiveChatButtonVisible(true);
  
    if (files.length > 0) {
    } else {
      try { 
        const response = await axios.post(`${baseUrl}/chat`, {
          message: newMessage,
          suggest_questions: suggestQuestions,
          play_audio_response: audioResponse,
          language: language
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Session-ID': sessionId
          },
          withCredentials: true,
        });
  
        const data = response.data;
  
        if (data && data.calendly) {
          setMessages(prevMessages => [
              ...prevMessages,
              { role: 'assistant', content: data.calendly, type: 'text' },
          ]);
          setShowTypingIndicator(false);
        } else {
          getEventSource();
        }
  
        if (data.suggested_questions) {
          setUserSuggestQuestions(data.suggested_questions.filter((q: string) => q.trim() !== ''));
        } else {
          setUserSuggestQuestions([]);
        }
      } catch (error) {
        console.error('Network or Server Error:', error);
      }
    }
  };

  const updateLastMessage = (newMessage: any) => {
    setShowTypingIndicator(false);
    setMessages(prevMessages => {
      const lastIndex = prevMessages.length - 1;
  
      if (prevMessages[lastIndex] && prevMessages[lastIndex].role === 'assistant') {
        const updatedMessages = [...prevMessages];
        updatedMessages[lastIndex] = newMessage;
        return updatedMessages;
      }
  
      return [...prevMessages, newMessage];
    });
  };

  const sanitizeText = (text: any) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleSaveChat = () => {
    const chatContent = messages.map(msg => `${msg.role}: ${sanitizeText(msg.content)}`).join('\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
      handleFileSubmit(selectedFiles);
      const newMessage = {
        role: 'user',
        content: '',
        files: selectedFiles,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  };

  const handleFileSubmit = async (selectedFiles: File[]) => {
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file));

    try {
      const response = await axios.post(`${baseUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Session-ID': sessionId
        }
      });

      const data = response.data;
      if (data && data.detail) {
        handleErrorMessage(data.detail);
      } 
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  const handleErrorMessage = (errorMessage: any) => {
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'assistant', type: 'error', content: errorMessage }
    ]);
    setShowTypingIndicator(false);
  };

  const handleCopyToClipboard = (messageContent: any, index: number) => {
    const contentToSanitize = typeof messageContent === 'object' && messageContent !== null ? messageContent.content : messageContent;
    const sanitizedText = sanitizeText(contentToSanitize);
    const textArea = document.createElement('textarea');
    textArea.value = sanitizedText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setTooltipText((prev) => ({
      ...prev,
      [index]: 'Kopirano!'
    }));
    setTimeout(() => {
      setTooltipText((prev) => ({
        ...prev,
        [index]: (language === 'en' ? 'Copy to clipboard' : 'Klikni da kopiraš tekst')
      }));
    }, 3000);
  };

  const getMessageContent = (message: any) => {
    if (typeof message.content === 'object') {
      return { __html: message.content.content };
    }
    return { __html: message.content };
  };

  const handleLikeClick = async () => {
    setLikeStatus('Good');
    setFeedbackVisible(false);
    const updatedMessages = [...messages];
    const lastMessageIndex = updatedMessages.length - 1;
    if (lastMessageIndex >= 0) {
      updatedMessages[lastMessageIndex].likeStatus = 'Good';
    }
    
    if (lastMessageIndex >= 0) {
      const lastQuestion = updatedMessages[lastMessageIndex - 1]?.content || "";
      const lastAnswer = updatedMessages[lastMessageIndex]?.content || "";

      updatedMessages[lastMessageIndex].feedback = feedback;
      setMessages(updatedMessages);
  
      try {
        await axios.post(`${baseUrl}/feedback`, {
          sessionId: sessionId,
          likeStatus: 'Good',
          feedback: 'Nije ostavljen komentar',
          lastQuestion: lastQuestion,
          lastAnswer: lastAnswer
        });
      } catch (error) {
        console.error('Failed to send like status:', error);
      }
    }
  };
  
  const handleDislikeClick = async () => {
    setLikeStatus('Bad');
    setFeedbackVisible(true);
  };
  
  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeedback(e.target.value);
  };

  const handleCancel = () => {
    setFeedback('');
    setLikeStatus(null);
    setFeedbackVisible(false);
  };
  
  const handleFeedbackSubmit = async () => {
    const updatedMessages = [...messages];
    const lastMessageIndex = updatedMessages.length - 1;

    if (lastMessageIndex >= 0) {
        const lastQuestion = updatedMessages[lastMessageIndex - 1]?.content || "";
        const lastAnswer = updatedMessages[lastMessageIndex]?.content || "";

        updatedMessages[lastMessageIndex].feedback = feedback;

        setMessages(updatedMessages);

        try {
            await axios.post(`${baseUrl}/feedback`, {
                sessionId: sessionId,
                status: 'Bad',
                feedback: feedback,
                lastQuestion: lastQuestion,
                lastAnswer: lastAnswer
            });
        } catch (error) {
            console.error('Failed to send feedback:', error);
        }
        setFeedbackVisible(false);
        setFeedback('');
    }
};

  const actions = [
    deleteIconVisible && { icon: <DeleteIcon />, name: (language === 'en' ? 'Delete' : 'Obriši'), onClick: handleClearChat },
    attachFileIconVisible && {
      icon: (
        <div style={{ position: 'relative' }}>
          <AttachFileSharpIcon style={{ color: files.length > 0 ? 'red' : 'inherit' }} />
        </div>
      ),
      name: (language === 'en' ? 'Attach files' : 'Dodaj priloge') as string,
      onClick: () => {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
          fileInput.click();
        }
      }
    },
    saveIconVisible && { icon: <SaveAltSharpIcon />, name: (language === 'en' ? 'Save' : 'Sačuvaj'), onClick: handleSaveChat },
    suggestQuestionsIconVisible && { icon: <TipsAndUpdatesIcon style={{ color: suggestQuestions ? 'red' : 'inherit' }} />, name: suggestQuestions ? (language === 'en' ? 'Turn off question suggestions' : 'Isključi predloge pitanja') : (language === 'en' ? 'Turn on question suggestions' : 'Predlozi pitanja'), onClick: handleSuggestQuestions },
    audioResponseIconVisible && { icon: <VolumeUpIcon style={{ color: audioResponse ? 'red' : 'inherit' }} />, name: audioResponse ? (language === 'en' ? 'Turn off assistant audio response' : 'Isključi audio odgovor asistenta') : (language === 'en' ? 'Turn on assistant audio response' : 'Slušaj odgovor asistenta'), onClick: handleAudioResponseClick },
  ];

   return (
    <div className="App" style={{ overflow: 'hidden' }}>
    {liveChatOpen ? (
        <div className="iframe-container" style={{ height: '100vh', overflow: 'hidden' }}>
          <iframe
            src="https://tawk.to/chat/66e6323050c10f7a00aa2b4b/1i7pj83k2"
            className="live-chat-iframe"
            title="Live Chat"
            style={{ width: '100%', height: '90%', border: 'none' }}
          />
          <div className='livechat'>
            <Button
              className="livechat"
              variant="outlined"
              onClick={() => setLiveChatOpen(false)}
              style={{
                border: 'none',
                marginTop: '10px',
                animation: 'fadeIn 0.3s ease-in-out 0.3s',
                animationFillMode: 'both',
                borderRadius: '20px',
                fontSize: '12px'
              }}
            >
              Vrati se na chatbot-a
            </Button>
          </div>
        </div>
      ) : (
      <div className="chat-container">
        <div className="messages" ref={containerRef}>
          {messages.map((message, index) => (
            <div key={index} className="message-container">
              {message.role === 'assistant' && (
                <div className="assistant-avatar">
                  <Avatar
                    alt="3Pi"
                    src={avatarImage}
                    sx={{ width: 25, height: 25 }}
                  />
                </div>
              )}
              <div className={`message ${message.role}`}>
                {message.type === 'error' ? (
                  <Alert variant="outlined" severity="error" style={{ color: 'red' }}>{message.content}</Alert>
                ) : (
                  <div>
                    <div onClick={() => {
                      if (message.files && message.files.length > 0) {
                        message.files.forEach((file: File) => handleDownloadFile(file));
                      } else {
                        handleCopyToClipboard(message.content, index);
                      }
                    }}>
                      <Tooltip
                        title={typeof tooltipText[index] === 'string' && tooltipText[index] !== '' ? tooltipText[index] : language === 'en' ? 'Copy to clipboard' : 'Klikni da kopiraš tekst'}
                        placement="top"
                        arrow
                      >
                        <p dangerouslySetInnerHTML={getMessageContent(message)} />
                      </Tooltip>
                      </div>
                      {message.files && message.files.length > 0 && (
                        <div className="attached-files" onClick={() => handleCopyToClipboard(message.content, index)}>
                          {message.files.map((file, fileIndex) => {
                            const isImage = file.type.startsWith('image/');
                            
                            return isImage ? (
                              <img
                                key={fileIndex}
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                style={{ width: '200px', height: '250px', objectFit: 'contain', borderRadius: '4px' }}
                                onClick={() => handleDownloadFile(file)}
                              />
                            ) : (
                              <Chip
                                key={fileIndex}
                                label={file.name}
                                icon={getFileTypeIcon(file)}
                                size="small"
                                onClick={() => handleDownloadFile(file)}
                              />
                            );
                          })}
                        </div>
                      )}
                      {message.role === 'assistant' && audioResponse && audioBase64 && index === messages.length - 1 && !isAssistantResponding && (
                        <audio controls autoPlay>
                          <source src={`data:audio/webm;base64,${audioBase64}`} type="audio/webm" />
                          Your browser does not support the audio element.
                        </audio>
                      )}
                    </div>
                )}
              {feedbackIconVisible && message.role === 'assistant' && index === messages.length - 1 && (
                <div className="feedback-buttons">
                  <IconButton className="icon-like"
                    disabled={message.likeStatus === 'Bad'}
                    onClick={handleLikeClick}
                  >
                    <ThumbUpIcon sx={{ fontSize: 21, color: likeStatus === 'Good' ? 'green' : 'inherit' }} />
                  </IconButton>
                  <IconButton className="icon-dislike"
                    disabled={message.likeStatus === 'Good'}
                    onClick={handleDislikeClick}
                  >
                    <ThumbDownIcon sx={{ fontSize: 21, color: likeStatus === 'Bad' ? 'red' : 'inherit' }} />
                  </IconButton>
                  {feedbackVisible && (
                    <div className="feedback-form">
                      <TextField
                        label={language === 'en' ? 'Leave a comment' : 'Ostavi komentar'}
                        variant="outlined"
                        value={feedback}
                        onChange={handleFeedbackChange}
                        multiline
                        rows={4}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#505050',
                              marginTop: '10px'
                            },
                            '&:hover fieldset': {
                              borderColor: 'white',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'white',
                              marginTop: '10px'          
                            },
                            color: '#ffff'      
                          },
                          '& .MuiInputLabel-root': {
                            color: '#ffff',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#ffff',
                            marginTop: '10px'
                          }
                        }}
                      />
                      <Button 
                        onClick={feedback ? handleFeedbackSubmit : handleCancel} 
                        sx={{
                          '&:hover': {
                            backgroundColor: '#505050'
                          },
                          marginTop: 1.2,
                          fontSize: 12
                        }}>
                        {feedback ? (<SendIcon sx={{ fontSize: 14, marginRight: 1 }} />) : (<CancelOutlinedIcon sx={{ fontSize: 14, marginRight: 1 }} />)}
                        {feedback
                          ? language === 'en' ? 'Send' : 'Pošalji'
                          : language === 'en' ? 'Cancel' : 'Odustani'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
          ))}
          {showTypingIndicator && (
          <div className="message-container">
            <div className="assistant-avatar">
              <Avatar
                alt="3Pi"
                src={avatarImage}
                sx={{ width: 25, height: 25 }}
              />
            </div>
            <div className="typing-indicator">
              <span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span>
            </div>
          </div>
          )}
        </div>
        <div ref={messagesEndRef} />
        <div className="input-row-container">
          <div className="input-row">
            <form onSubmit={handleSubmit} className="message-input">
              <div className="input-container">
              <textarea
                rows={1}
                placeholder={language === 'en' ? 'How can I help you?' : 'Kako mogu da ti pomognem?'}
                value={userMessage}
                onChange={(e) => {
                  setUserMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`; 
                }}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e); 
                  }
                }}
                className="expanding-textarea"
              />
                {userMessage.trim() ? (
                  <Button type="submit" className="send-button">
                    <SendIcon />
                  </Button>
                ) : (
                  voiceRecordIconVisible &&
                  <Tooltip title={isRecording ? 
                    (language === 'en' ? 'Click to stop recording' : 'Klikni da isključiš snimanje') : 
                    (language === 'en' ? 'Click to start recording' : 'Klikni da započneš snimanje')}
                    placement="top">
                    <Button
                      className={`send-button ${isRecording ? 'recording' : ''}`}
                      onClick={handleVoiceClick}
                    >
                      <KeyboardVoiceIcon />
                    </Button>
                  </Tooltip>
                )}
              </div>
            </form>
            <Tooltip title={!openSpeedDial ? (language === 'en' ? 'More options' : 'Više opcija') : ''} placement="top">
              <SpeedDial
                ariaLabel="SpeedDial basic example"
                className="speed-dial"
                icon={<SpeedDialIcon />}
                onClick={handleToggle}
                open={openSpeedDial} 
              >
                {actions
                  .filter(action => action !== false)
                  .map((action) => (
                    <SpeedDialAction
                      key={typeof action.name === 'string' ? action.name : action.name}
                      icon={action.icon}
                      tooltipTitle={action.name}
                      onClick={handleActionClick(action.onClick)}
                    />
                ))}
              </SpeedDial>
            </Tooltip>
            <input
              id="fileInput"
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          {!isAssistantResponding && userSuggestQuestions.length > 0 && suggestQuestions && suggestQuestionsVisible && (
            <div className="suggested-questions">
              {userSuggestQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => handleSuggestedQuestionClick(question)}
                  style={{
                    border: 'none', 
                    marginBottom: '10px',
                    animation: 'fadeIn 0.3s ease-in-out 0.3s',
                    animationFillMode: 'both',
                    borderRadius: '20px',
                    fontSize: '13px',
                    textTransform: 'none'}}
                >
                  {question}
                </Button>
              ))}
            </div>
          )}
          {messages.length === 0 && initialQuestionsVisible && (
              <div className="initial-questions" style={{  marginBottom: '10px', marginLeft: '10px' }}>
                {initialFirstQuestion && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleSuggestedQuestionClick(language === 'en' ? initialFirstQuestionEng : initialFirstQuestion);
                      setInitialQuestionsVisible(false);
                    }}
                    style={{
                      border: 'none',
                      marginBottom: '10px',
                      animation: 'fadeIn 0.3s ease-in-out 0.3s', 
                      animationFillMode: 'both',
                      borderRadius: '20px',
                      fontSize: '12px'}}
                  >
                    {language === 'en' ? initialFirstQuestionEng : initialFirstQuestion}
                  </Button>
                )}
                {initialSecondQuestion && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleSuggestedQuestionClick(language === 'en' ? initialSecondQuestionEng : initialSecondQuestion);
                      setInitialQuestionsVisible(false);
                    }}
                    style={{
                      border: 'none', 
                      marginBottom: '10px',
                      animation: 'fadeIn 0.3s ease-in-out 0.3s', 
                      animationFillMode: 'both',
                      borderRadius: '20px',
                      fontSize: '12px'}}
                  >
                    {language === 'en' ? initialSecondQuestionEng : initialSecondQuestion}
                  </Button>
                )}
              </div>
          )}
          {liveChatButtonVisible && (
              <div className='livechat'>
                <Button
                  variant="outlined"
                  onClick={() => setLiveChatOpen(true)}
                  style={{
                    border: 'none',
                    marginBottom: '10px',
                    animation: 'fadeIn 0.3s ease-in-out 0.3s',
                    animationFillMode: 'both',
                    borderRadius: '20px',
                    fontSize: '12px',
                    justifyContent: 'center'
                  }}
                >
                  Uključi operatera
                </Button>
                </div>
            )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    )}
    </div>
  );
}
