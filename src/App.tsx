/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  User,
  Hash,
  Phone,
  Users,
  CreditCard,
  Mail,
  MessageSquare,
  HelpCircle,
  Building2
} from 'lucide-react';

// --- Types ---
interface FormData {
  nomeCompleto: string;
  protocolo: string;
  contato: string;
  tipoUsuario: 'Cliente' | 'Licenciado' | '';
  documento: string;
  email: string;
  setor: string;
  detalhes: string;
}

interface FormErrors {
  [key: string]: string;
}

// --- Constants ---
const SETORES = [
  'Suporte ao cliente',
  'Suporte ao licenciado',
  'Contratos e documentação',
  'Inadimplência e Cobrança',
  'Cancelamento',
  'Placas Solares',
  'Outros'
];

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: '',
    protocolo: '',
    contato: '',
    tipoUsuario: '',
    documento: '',
    email: '',
    setor: '',
    detalhes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  // --- Validation ---
  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};

    switch (currentStep) {
      case 1:
        if (formData.nomeCompleto.trim().length < 5) {
          newErrors.nomeCompleto = 'O nome deve ter pelo menos 5 caracteres.';
        }
        break;
      case 2:
        if (formData.protocolo.trim().length < 6) {
          newErrors.protocolo = 'O protocolo deve ter pelo menos 6 caracteres.';
        }
        break;
      case 3:
        if (!formData.contato.trim()) {
          newErrors.contato = 'Por favor, insira um número para contato.';
        }
        break;
      case 4:
        if (!formData.tipoUsuario) {
          newErrors.tipoUsuario = 'Por favor, selecione uma opção.';
        }
        break;
      case 5:
        if (formData.documento.trim().length < 11) {
          newErrors.documento = 'O CPF/CNPJ deve ter pelo menos 11 caracteres.';
        }
        break;
      case 6:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Please enter a valid email.';
        }
        break;
      case 7:
        if (!formData.setor) {
          newErrors.setor = 'Por favor, selecione um setor.';
        }
        break;
      case 8:
        if (formData.detalhes.trim().length < 10) {
          newErrors.detalhes = 'Por favor, forneça mais detalhes (mínimo 10 caracteres).';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/proxy-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          source: window.location.href
        }),
      });

      const responseData = await response.text();
      
      if (response.ok) {
        setIsSuccess(true);
      } else {
        setSubmitError(`Resposta do n8n (${response.status}): ${responseData}`);
      }
    } catch (error) {
      setSubmitError("Erro de conexão com o servidor local.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Helpers ---
  const renderInput = (
    id: keyof FormData,
    label: string,
    type: string = 'text',
    placeholder: string = 'Enter your answer',
    icon: React.ReactNode
  ) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-slate-800">{label}</h2>
      </div>
      <input
        type={type}
        value={formData[id]}
        onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
        placeholder={placeholder}
        className={`w-full p-4 bg-white border-2 rounded-xl outline-none transition-all text-lg
          ${errors[id] ? 'border-red-400 focus:border-red-500' : 'border-slate-100 focus:border-emerald-500'}
        `}
        autoFocus
        onKeyDown={(e) => e.key === 'Enter' && nextStep()}
      />
      <p className="text-slate-400 text-xs flex items-center gap-1 ml-1">
        Pressione <span className="font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Enter ↵</span> para avançar
      </p>
      {errors[id] && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 flex items-center gap-1 text-sm font-medium"
        >
          <AlertCircle size={14} /> {errors[id]}
        </motion.p>
      )}
    </div>
  );

  const renderTextArea = (
    id: keyof FormData,
    label: string,
    placeholder: string = 'Enter your answer',
    icon: React.ReactNode
  ) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-slate-800">{label}</h2>
      </div>
      <textarea
        value={formData[id]}
        onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
        placeholder={placeholder}
        rows={5}
        className={`w-full p-4 bg-white border-2 rounded-xl outline-none transition-all text-lg resize-none
          ${errors[id] ? 'border-red-400 focus:border-red-500' : 'border-slate-100 focus:border-emerald-500'}
        `}
        autoFocus
      />
      {errors[id] && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 flex items-center gap-1 text-sm font-medium"
        >
          <AlertCircle size={14} /> {errors[id]}
        </motion.p>
      )}
    </div>
  );

  const renderRadio = (
    id: keyof FormData,
    label: string,
    options: string[],
    icon: React.ReactNode
  ) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-slate-800">{label}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => {
              setFormData({ ...formData, [id]: option });
              setErrors({ ...errors, [id]: '' });
            }}
            className={`p-4 text-left border-2 rounded-xl transition-all font-medium text-lg
              ${formData[id] === option 
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                : 'border-slate-100 hover:border-emerald-200 text-slate-600'}
            `}
          >
            {option}
          </button>
        ))}
      </div>
      {errors[id] && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 flex items-center gap-1 text-sm font-medium"
        >
          <AlertCircle size={14} /> {errors[id]}
        </motion.p>
      )}
    </div>
  );

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Enviado com sucesso!</h1>
          <p className="text-slate-600 text-lg">
            Obrigado por entrar em contato. Sua solicitação foi registrada e nossa equipe entrará em contato em breve.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            Novo Formulário
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      {/* Header */}
      <div className="max-w-2xl w-full mb-8 flex flex-col items-center sm:items-start">
        <img 
          src="https://static.wixstatic.com/media/b256d1_8ae6bed7ce7e496782b9d6412d635e89~mv2.png/v1/fill/w_980,h_299,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logo%20marca%20png%20verde.png" 
          alt="iGreen Energy Logo" 
          className="h-16 w-auto mb-4 object-contain"
          referrerPolicy="no-referrer"
        />
        <p className="text-slate-500 font-medium text-lg italic">Ouvidoria iGreen - Nosso espaço, sua voz!</p>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 w-full">
          <motion.div 
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
          />
        </div>

        <div className="p-8 sm:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-[300px]"
            >
              <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest mb-6">
                Pergunta {step} de {totalSteps}
              </p>

              {step === 1 && renderInput('nomeCompleto', 'Qual seu nome completo?', 'text', 'Digite seu nome completo', <User size={20} />)}
              {step === 2 && renderInput('protocolo', 'Qual o protocolo de atendimento?', 'text', 'Digite o protocolo (mín. 6 caracteres)', <Hash size={20} />)}
              {step === 3 && renderInput('contato', 'Qual seu número para contato?', 'tel', 'Enter your answer', <Phone size={20} />)}
              {step === 4 && renderRadio('tipoUsuario', 'Você é cliente ou licenciado?', ['Cliente', 'Licenciado'], <Users size={20} />)}
              {step === 5 && renderInput('documento', 'Qual o CPF ou CNPJ do titular?', 'text', 'Digite apenas números (mín. 11)', <CreditCard size={20} />)}
              {step === 6 && renderInput('email', 'Qual seu e-mail?', 'email', 'Please enter an email', <Mail size={20} />)}
              {step === 7 && renderRadio('setor', 'Sobre qual setor você gostaria de falar?', SETORES, <Building2 size={20} />)}
              {step === 8 && renderTextArea('detalhes', 'Pode nos contar com o máximo de detalhes o que aconteceu?', 'Enter your answer', <MessageSquare size={20} />)}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-start gap-6 sm:gap-8">
            <button
              onClick={nextStep}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-12 py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 order-1"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step === totalSteps ? (
                <>Enviar <Send size={20} /></>
              ) : (
                <>Próximo <ChevronRight size={20} /></>
              )}
            </button>

            <div className="flex flex-col items-center sm:items-start w-full sm:w-auto order-2">
              <button
                onClick={prevStep}
                disabled={step === 1 || isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
                  ${step === 1 || isSubmitting ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
                `}
              >
                <ChevronLeft size={20} /> Anterior
              </button>
              
              {submitError && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs mt-2 font-medium max-w-[200px] text-center sm:text-left"
                >
                  {submitError}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <p className="mt-8 text-slate-400 text-sm font-medium">
        &copy; {new Date().getFullYear()} iGreen Energy. Todos os direitos reservados.
      </p>
    </div>
  );
}
