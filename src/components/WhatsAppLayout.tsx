import { useState, useEffect } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatArea } from './ChatArea';
import { useWAHA } from '@/hooks/useWAHA';
import { SessionStatus } from './SessionStatus';

export const WhatsAppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const wahaState = useWAHA();

  // Set up webhook receiver for demo purposes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.wahaWebhookReceived = (message) => {
      wahaState.addMessage(message);
    };

    return () => {
      delete window.wahaWebhookReceived;
    };
  }, [wahaState.addMessage]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSelectChat = (chatId: string) => {
    wahaState.selectChat(chatId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`relative flex h-[100dvh] bg-background pt-14 ${isMobile ? '' : 'overflow-hidden'}`}>
      {/* Session Status Bar */}
      <SessionStatus
        status={wahaState.sessionStatus}
        onRefresh={wahaState.checkSessionStatus}
      />

      {/* Chat Sidebar */}
      <div
        className={`${
          isMobile
            ? sidebarOpen
              ? 'flex w-full'
              : 'hidden'
            : sidebarOpen
              ? 'w-80 flex'
              : 'w-0 flex'
        } transition-all duration-300 overflow-hidden border-r border-border bg-sidebar flex-shrink-0`}
      >
        <ChatSidebar
          chats={wahaState.chats}
          activeChatId={wahaState.activeChatId}
          onSelectChat={handleSelectChat}
          loading={wahaState.loading}
          onRefresh={wahaState.loadChats}
        />
      </div>

      {/* Main Chat Area */}
      <div className={`${isMobile && sidebarOpen ? 'hidden' : 'flex'} flex-1 flex-col`}>
        <ChatArea
          activeChat={wahaState.activeChat}
          messages={wahaState.activeChatMessages}
          onSendMessage={wahaState.sendMessage}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};