import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, User, Bot, ShieldCheck, ArrowRight } from 'lucide-react';

export default function SmartCoach({ onNavigateToPlan, user }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello! I am your **SaveWise AI Coach**. 

Ask me anything about your savings! For example:
- "I have ₹2,000. What can I do?"
- "How can I turn ₹100 into ₹10,000 quickly?"
- "What is the difference between a Demat and Trading account?"
- "Explain compounding like I'm 10 years old."`,
      suggestedActions: ['I have ₹1,000', 'Turn ₹100 into ₹10,000', 'What is a Mutual Fund?']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('savewise_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      const botMsg = {
        sender: 'bot',
        text: data.message,
        suggestedActions: data.suggestedActions || []
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Sorry, I am having trouble connecting to the advisory server. Please try again.',
        suggestedActions: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (action === 'Open Planning Wizard') {
      onNavigateToPlan();
      return;
    }
    handleSendMessage(action);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 180px)', minHeight: '520px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>SaveWise AI Financial Coach</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)' }}>
              ● Guarded by Strict Financial Safety Rules
            </span>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'none', sm: 'block' }}>
          No get-rich-quick claims • 100% Educational
        </div>
      </div>

      {/* Chat Area */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Messages Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                gap: '0.5rem',
                flexDirection: m.sender === 'user' ? 'row-reverse' : 'row'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: m.sender === 'user' ? 'var(--indigo-500)' : 'var(--emerald-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {m.sender === 'user' ? <User size={15} color="#fff" /> : <Bot size={15} color="#fff" />}
              </div>

              <div>
                <div style={{
                  padding: '0.875rem 1.125rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: m.sender === 'user' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-secondary)',
                  border: m.sender === 'user' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line'
                }}>
                  {m.text}
                </div>

                {/* Suggested Follow-up Action Chips */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                    {m.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleActionClick(action)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        <Sparkles size={11} color="var(--emerald-400)" />
                        <span>{action}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--emerald-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={15} color="#fff" />
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Thinking through financial safety guidelines...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Field Bar */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={{ display: 'flex', gap: '0.75rem' }}
          >
            <input
              type="text"
              placeholder="Ask anything: 'I have ₹5,000', 'Explain SIP', 'Is this trading group legit?'..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="input-field"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="btn btn-primary"
            >
              <Send size={16} />
              <span>Send</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
