import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Mail, 
  Code 
} from 'lucide-react';
import { FaWhatsapp, FaTwitter, FaFacebook, FaLinkedin } from 'react-icons/fa';
import './ShareModal.css';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  embedType?: 'video' | 'podcast';
}

export default function ShareModal({ isOpen, onClose, url, title = 'Check this out!', embedType = 'video' }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const shareLinks = [
    {
      name: 'Embed',
      icon: <Code size={24} />,
      className: 'embed',
      action: () => setShowEmbed(!showEmbed)
    },
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp size={24} />,
      className: 'whatsapp',
      action: () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank')
    },
    {
      name: 'Twitter',
      icon: <FaTwitter size={24} />,
      className: 'twitter',
      action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
    },
    {
      name: 'Facebook',
      icon: <FaFacebook size={24} />,
      className: 'facebook',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin size={24} />,
      className: 'linkedin',
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
    },
    {
      name: 'Email',
      icon: <Mail size={24} />,
      className: 'email',
      action: () => window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
    }
  ];

  const embedCode = `<iframe width="560" height="315" src="${url.replace('/watch/', '/embed/')}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="share-modal-header">
          <h3>Share</h3>
          <button className="share-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="share-options-container">
          {shareLinks.map((link) => (
            <button 
              key={link.name}
              className="share-option-btn" 
              onClick={link.action}
            >
              <div className={`share-icon-circle ${link.className}`}>
                {link.icon}
              </div>
              <span>{link.name}</span>
            </button>
          ))}
        </div>

        <div className="share-link-container">
          <input 
            type="text" 
            className="share-link-input" 
            value={url} 
            readOnly 
          />
          <button 
            className={`share-copy-btn ${copied ? 'copied' : ''}`}
            onClick={() => handleCopyLink(url)}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {showEmbed && (
          <div className="share-embed-preview">
            <h4>Embed {embedType === 'video' ? 'Video' : 'Podcast'}</h4>
            <textarea 
              className="share-embed-code" 
              readOnly 
              value={embedCode}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
        )}

      </div>
    </div>
  );
}
