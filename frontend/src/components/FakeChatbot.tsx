import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Fade,
  Avatar,
} from '@mui/material';

type Language = 'en' | 'fr' | 'ar';
type CategoryKey = 'complaints' | 'card' | 'account' | 'transaction' | 'credit' | 'fraud' | 'payment' | 'app' | 'loan';

type Category = {
  key: CategoryKey;
  label: {
    en: string;
    fr: string;
    ar: string;
  };
};

const FakeChatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  useEffect(() => {
    const saved = localStorage.getItem('chat_history');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  const categories: Category[] = [
    { key: 'complaints', label: { en: 'Complaints', fr: 'Réclamations', ar: 'الشكاوى' } },
    { key: 'card', label: { en: 'Card Issues', fr: 'Problèmes de carte', ar: 'مشاكل البطاقة' } },
    { key: 'account', label: { en: 'Account Services', fr: 'Services de compte', ar: 'خدمات الحساب' } },
    { key: 'transaction', label: { en: 'Transaction Issues', fr: 'Problèmes de transaction', ar: 'مشاكل المعاملات' } },
    { key: 'credit', label: { en: 'Credit Card Issues', fr: 'Problèmes de carte de crédit', ar: 'مشاكل بطاقة الائتمان' } },
    { key: 'fraud', label: { en: 'Fraud Concerns', fr: 'Préoccupations liées à la fraude', ar: 'القلق بشأن الاحتيال' } },
    { key: 'payment', label: { en: 'Payment Issues', fr: 'Problèmes de paiement', ar: 'مشاكل الدفع' } },
    { key: 'app', label: { en: 'Banking App Issues', fr: 'Problèmes de l\'application bancaire', ar: 'مشاكل تطبيق البنك' } },
    { key: 'loan', label: { en: 'Loan Information', fr: 'Informations sur le prêt', ar: 'معلومات عن القرض' } },
  ];
  
  const categoryQuestions: any = {
    complaints: {
      en: 'How can I submit a complaint?',
      fr: 'Comment puis-je soumettre une réclamation ?',
      ar: 'كيف يمكنني تقديم شكوى؟',
    },
    card: {
      en: 'I have a problem with my bank card.',
      fr: 'J’ai un problème avec ma carte bancaire.',
      ar: 'لدي مشكلة في بطاقتي البنكية.',
    },
    account: {
      en: 'I need help with my account services.',
      fr: 'J’ai besoin d’aide pour les services de mon compte.',
      ar: 'أحتاج إلى مساعدة في خدمات حسابي.',
    },
    transaction: {
      en: 'I have a question about a transaction.',
      fr: 'J’ai une question concernant une transaction.',
      ar: 'لدي سؤال حول معاملة.',
    },
    credit: {
      en: 'I need assistance with my credit card.',
      fr: 'J’ai besoin d’aide avec ma carte de crédit.',
      ar: 'أحتاج إلى مساعدة بشأن بطاقتي الائتمانية.',
    },
    fraud: {
      en: 'I think I’ve been a victim of fraud.',
      fr: 'Je pense avoir été victime de fraude.',
      ar: 'أعتقد أنني كنت ضحية للاحتيال.',
    },
    payment: {
      en: 'I need help with a payment issue.',
      fr: 'J’ai besoin d’aide pour un problème de paiement.',
      ar: 'أحتاج إلى مساعدة في مشكلة دفع.',
    },
    app: {
      en: 'I need help with the banking app.',
      fr: 'J’ai besoin d’aide avec l’application bancaire.',
      ar: 'أحتاج إلى مساعدة في تطبيق البنك.',
    },
    loan: {
      en: 'I need information about my loan.',
      fr: 'J’ai besoin d’informations sur mon prêt.',
      ar: 'أحتاج إلى معلومات حول قرضي.',
    },
  };
  
  const generateFakeResponse = (question: string) => {
    if (question.toLowerCase().includes('bank account')) {
      return {
        en: "I’m happy to assist you. Could you please provide more details about the issue you're facing with your account?",
        fr: "Je suis heureux de vous aider. Pourriez-vous fournir plus de détails sur le problème que vous rencontrez avec votre compte ?",
        ar: "يسعدني مساعدتك. هل يمكنك تقديم مزيد من التفاصيل حول المشكلة التي تواجهها مع حسابك؟",
      }[language];
    }
    if (question.toLowerCase().includes('forgot password')) {
      return {
        en: "No worries! You can reset your password by following the 'Forgot Password' link on the login page. I can guide you step-by-step if you need help.",
        fr: "Pas de souci ! Vous pouvez réinitialiser votre mot de passe en suivant le lien 'Mot de passe oublié' sur la page de connexion. Je peux vous guider étape par étape si vous avez besoin d'aide.",
        ar: "لا داعي للقلق! يمكنك إعادة تعيين كلمة المرور الخاصة بك من خلال الرابط 'نسيت كلمة المرور' في صفحة تسجيل الدخول. يمكنني إرشادك خطوة بخطوة إذا كنت بحاجة إلى مساعدة.",
      }[language];
    }
    if (question.toLowerCase().includes('transaction')) {
      return {
        en: "I’m sorry to hear that! Please provide the transaction details, and I’ll help track it down. Sometimes, transactions take up to 24 hours to process.",
        fr: "Je suis désolé d'entendre cela ! Veuillez fournir les détails de la transaction, et je vous aiderai à la retrouver. Parfois, les transactions peuvent prendre jusqu'à 24 heures pour être traitées.",
        ar: "آسف لسماع ذلك! يرجى تقديم تفاصيل المعاملة وسأساعدك في تتبعها. أحيانًا تستغرق المعاملات حتى 24 ساعة للمعالجة.",
      }[language];
    }
    if (question.toLowerCase().includes('card')) {
      return {
        en: "For card issues, please contact card support or block your card via the app.",
        fr: "Pour les problèmes de carte, veuillez contacter le support ou bloquer votre carte via l'application.",
        ar: "لمشاكل البطاقة، يرجى التواصل مع الدعم أو حظر بطاقتك عبر التطبيق.",
      }[language];
    }
    if (question.toLowerCase().includes('update account info')) {
      return {
        en: "Yes, you can update your account information by logging into your online banking portal and visiting the 'Account Settings' section.",
        fr: "Oui, vous pouvez mettre à jour vos informations de compte en vous connectant à votre portail bancaire en ligne et en visitant la section 'Paramètres du compte'.",
        ar: "نعم، يمكنك تحديث معلومات حسابك عن طريق تسجيل الدخول إلى بوابة البنك عبر الإنترنت والذهاب إلى قسم 'إعدادات الحساب'.",
      }[language];
    }
    if (question.toLowerCase().includes('credit limit')) {
      return {
        en: "You may be eligible for a credit limit increase. You can apply by contacting our customer support team, or I can provide you with more details on how to apply.",
        fr: "Vous pouvez être éligible à une augmentation de votre limite de crédit. Vous pouvez faire une demande en contactant notre équipe de support client, ou je peux vous fournir plus de détails sur la façon de postuler.",
        ar: "قد تكون مؤهلاً لزيادة حد الائتمان الخاص بك. يمكنك التقديم من خلال التواصل مع فريق دعم العملاء لدينا، أو يمكنني تزويدك بمزيد من التفاصيل حول كيفية التقديم.",
      }[language];
    }
    if (question.toLowerCase().includes('fraud')) {
      return {
        en: "I’m really sorry to hear that! Please immediately contact our fraud team or call the emergency support line. I can assist you with steps to take if needed.",
        fr: "Je suis vraiment désolé d'entendre cela ! Veuillez immédiatement contacter notre équipe de fraude ou appeler la ligne d'assistance d'urgence. Je peux vous aider avec les étapes à suivre si nécessaire.",
        ar: "آسف جدًا لسماع ذلك! يرجى الاتصال فورًا بفريق الاحتيال لدينا أو الاتصال بخط الدعم الطارئ. يمكنني مساعدتك في اتخاذ الإجراءات إذا لزم الأمر.",
      }[language];
    }
    if (question.toLowerCase().includes('payment')) {
      return {
        en: "Let’s check what happened. Please provide the transaction details, and I’ll assist you in resolving the payment issue.",
        fr: "Vérifions ce qui s'est passé. Veuillez fournir les détails de la transaction, et je vous aiderai à résoudre le problème de paiement.",
        ar: "دعنا نتحقق مما حدث. يرجى تقديم تفاصيل المعاملة وسأساعدك في حل مشكلة الدفع.",
      }[language];
    }
    if (question.toLowerCase().includes('update app')) {
      return {
        en: "To update the app, visit your device’s app store, search for our app, and click on 'Update.' If you need step-by-step guidance, I can assist with that.",
        fr: "Pour mettre à jour l'application, visitez le magasin d'applications de votre appareil, recherchez notre application et cliquez sur 'Mettre à jour'. Si vous avez besoin d'une aide étape par étape, je peux vous aider.",
        ar: "لتحديث التطبيق، قم بزيارة متجر التطبيقات على جهازك، وابحث عن تطبيقنا، واضغط على 'تحديث'. إذا كنت بحاجة إلى إرشادات خطوة بخطوة، يمكنني مساعدتك في ذلك.",
      }[language];
    }
    if (question.toLowerCase().includes('submit complaint')) {
      return {
        en: "You can submit a complaint by navigating to the 'Submit Reclamation' section.",
        fr: "Vous pouvez soumettre une réclamation dans la section 'Soumettre une réclamation'.",
        ar: "يمكنك تقديم شكوى من خلال قسم 'تقديم شكوى'.",
      }[language];
    }
    return {
      en: 'Thank you for your message. We will assist you shortly.',
      fr: 'Merci pour votre message. Nous allons vous aider sous peu.',
      ar: 'شكرًا لرسالتك. سنساعدك قريبًا.',
    }[language];
  };
  

  const handleCategoryClick = (key: CategoryKey) => {
    const question = categoryQuestions[key][language];
    const newMessages = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);
    simulateResponse(key, newMessages);
  };

  // Response templates for different categories
  const responses = {
    complaints: {
      en: 'You can submit a complaint by navigating to the "Submit Reclamation" section.',
      fr: 'Vous pouvez soumettre une réclamation dans la section "Soumettre une réclamation".',
      ar: 'يمكنك تقديم شكوى من خلال قسم "تقديم شكوى".',
    },
    card: {
      en: 'For card issues, please contact card support or block your card via the app.',
      fr: 'Pour les problèmes de carte, veuillez contacter le support ou bloquer votre carte via l\'application.',
      ar: 'لمشاكل البطاقة، يرجى التواصل مع الدعم أو حظر بطاقتك عبر التطبيق.',
    },
    account: {
      en: 'I\'m happy to assist you. Could you please provide more details about the issue you\'re facing with your account?',
      fr: 'Je suis heureux de vous aider. Pourriez-vous fournir plus de détails sur le problème que vous rencontrez avec votre compte ?',
      ar: 'يسعدني مساعدتك. هل يمكنك تقديم مزيد من التفاصيل حول المشكلة التي تواجهها مع حسابك؟',
    },
    transaction: {
      en: 'Let\'s check what happened. Please provide the transaction details, and I\'ll assist you in resolving the payment issue.',
      fr: 'Vérifions ce qui s\'est passé. Veuillez fournir les détails de la transaction, et je vous aiderai à résoudre le problème de paiement.',
      ar: 'دعنا نتحقق مما حدث. يرجى تقديم تفاصيل المعاملة وسأساعدك في حل مشكلة الدفع.',
    },
    credit: {
      en: 'You may be eligible for a credit limit increase. You can apply by contacting our customer support team, or I can provide you with more details on how to apply.',
      fr: 'Vous pouvez être éligible à une augmentation de votre limite de crédit. Vous pouvez faire une demande en contactant notre équipe de support client, ou je peux vous fournir plus de détails sur la façon de postuler.',
      ar: 'قد تكون مؤهلاً لزيادة حد الائتمان الخاص بك. يمكنك التقديم من خلال التواصل مع فريق دعم العملاء لدينا، أو يمكنني تزويدك بمزيد من التفاصيل حول كيفية التقديم.',
    },
    fraud: {
      en: 'I\'m really sorry to hear that! Please immediately contact our fraud team or call the emergency support line. I can assist you with steps to take if needed.',
      fr: 'Je suis vraiment désolé d\'entendre cela ! Veuillez immédiatement contacter notre équipe de fraude ou appeler la ligne d\'assistance d\'urgence. Je peux vous aider avec les étapes à suivre si nécessaire.',
      ar: 'آسف جدًا لسماع ذلك! يرجى الاتصال فورًا بفريق الاحتيال لدينا أو الاتصال بخط الدعم الطارئ. يمكنني مساعدتك في اتخاذ الإجراءات إذا لزم الأمر.',
    },
    payment: {
      en: 'Let\'s check what happened. Please provide the transaction details, and I\'ll assist you in resolving the payment issue.',
      fr: 'Vérifions ce qui s\'est passé. Veuillez fournir les détails de la transaction, et je vous aiderai à résoudre le problème de paiement.',
      ar: 'دعنا نتحقق مما حدث. يرجى تقديم تفاصيل المعاملة وسأساعدك في حل مشكلة الدفع.',
    },
    app: {
      en: 'To update the app, visit your device\'s app store, search for our app, and click on \"Update.\" If you need step-by-step guidance, I can assist with that.',
      fr: 'Pour mettre à jour l\'application, visitez le magasin d\'applications de votre appareil, recherchez notre application et cliquez sur \"Mettre à jour\". Si vous avez besoin d\'une aide étape par étape, je peux vous aider.',
      ar: 'لتحديث التطبيق، قم بزيارة متجر التطبيقات على جهازك، وابحث عن تطبيقنا، واضغط على \"تحديث\". إذا كنت بحاجة إلى إرشادات خطوة بخطوة، يمكنني مساعدتك في ذلك.',
    },
    loan: {
      en: 'You may be eligible for a credit limit increase. You can apply by contacting our customer support team, or I can provide you with more details on how to apply.',
      fr: 'Vous pouvez être éligible à une augmentation de votre limite de crédit. Vous pouvez faire une demande en contactant notre équipe de support client, ou je peux vous fournir plus de détails sur la façon de postuler.',
      ar: 'قد تكون مؤهلاً لزيادة حد الائتمان الخاص بك. يمكنك التقديم من خلال التواصل مع فريق دعم العملاء لدينا، أو يمكنني تزويدك بمزيد من التفاصيل حول كيفية التقديم.',
    },
    default: {
      en: 'Thank you for your message. We will assist you shortly.',
      fr: 'Merci pour votre message. Nous allons vous aider sous peu.',
      ar: 'شكرًا لرسالتك. سنساعدك قريبًا.',
    }
  };

  const simulateResponse = (categoryKey: CategoryKey, msgList: any[]) => {
    setLoading(true);
    setTimeout(() => {
      const response = responses[categoryKey]?.[language] ?? responses.default[language];
      setMessages([...msgList, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 1200);
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('chat_history');
  };

  const getTimeStamp = () => {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mt: 4,
        maxWidth: 600,
        mx: 'auto',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #fff 0%, #fff 100%)',
        boxShadow: '0 2px 8px 0 rgba(220,20,60,0.10)',
        border: `2px solid #e53935`,
        fontSize: '1.1rem',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ color: '#e53935', fontWeight: 800, letterSpacing: 1 }}>🤖 AI Assistant</Typography>
        <Select value={language} onChange={(e) => setLanguage(e.target.value as Language)} size="small"
          sx={{
            bgcolor: '#fff',
            border: '1px solid #e53935',
            color: '#e53935',
            fontWeight: 600,
            borderRadius: 2,
            '& .MuiSelect-icon': { color: '#e53935' }
          }}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="fr">Français</MenuItem>
          <MenuItem value="ar">العربية</MenuItem>
        </Select>
      </Box>

      {messages.length === 0 && (
        <Fade in>
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {categories.map((cat) => (
              <Button
                key={cat.key}
                variant="contained"
                onClick={() => handleCategoryClick(cat.key)}
                sx={{
                  fontSize: '1.1rem',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  color: '#fff',
                  background: 'linear-gradient(90deg, #e53935 0%, #e35d5b 100%)',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px 0 rgba(220,20,60,0.10)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #e35d5b 0%, #e53935 100%)',
                    color: '#fff',
                  }
                }}
              >
                {cat.label[language]}
              </Button>
            ))}
          </Box>
        </Fade>
      )}

      <List sx={{ maxHeight: 300, overflowY: 'auto', mb: 2, padding: 1 }}>
        {messages.map((msg, index) => (
          <ListItem key={index} sx={{ paddingLeft: 0 }}>
            <Avatar sx={{ background: msg.role === 'user' ? 'linear-gradient(90deg, #e53935 0%, #e35d5b 100%)' : '#fff', color: msg.role === 'user' ? '#fff' : '#e53935', border: '2px solid #e53935', width: 28, height: 28, fontWeight: 700 }}>
              {msg.role === 'user' ? '🧑‍💼' : '🤖'}
            </Avatar>
            <ListItemText
              primary={
                <Box
                  sx={{
                    background: msg.role === 'user' ? 'linear-gradient(90deg, #e53935 0%, #e35d5b 100%)' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#222',
                    border: msg.role === 'user' ? 'none' : '1.5px solid #e53935',
                    boxShadow: msg.role === 'user' ? '0 2px 8px 0 rgba(220,20,60,0.10)' : '0 2px 8px 0 rgba(220,20,60,0.04)',
                    fontWeight: msg.role === 'user' ? 600 : 500,
                    padding: '15px 25px',
                    borderRadius: '25px',
                    maxWidth: '70%',
                    wordBreak: 'break-word',
                    marginBottom: '12px',
                    fontSize: '1.2rem',
                    lineHeight: '1.6',
                  }}
                >
                  {msg.content}
                </Box>
              }
            />
            <Typography variant="caption" sx={{ 
              textAlign: 'right', 
              display: 'block', 
              marginTop: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#e53935'
            }}>
              {getTimeStamp()}
            </Typography>
          </ListItem>
        ))}
        {loading && (
          <ListItem>
            <ListItemText primary="🤖 is typing..." />
            <CircularProgress size={18} />
          </ListItem>
        )}
      </List>

      <Box textAlign="center" mt={3}>
        <Button 
          onClick={clearHistory} 
          size="medium"
          sx={{
            fontSize: '1.1rem',
            padding: '10px 25px',
            borderRadius: '25px',
            color: '#fff',
            background: 'linear-gradient(90deg, #e53935 0%, #e35d5b 100%)',
            fontWeight: 700,
            boxShadow: '0 2px 8px 0 rgba(220,20,60,0.10)',
            '&:hover': {
              background: 'linear-gradient(90deg, #e35d5b 0%, #e53935 100%)',
              color: '#fff',
            }
          }}
        >
          Clear Chat History
        </Button>
      </Box>
    </Paper>
  );
};

export default FakeChatbot;
