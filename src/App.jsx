import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Utensils, ChefHat, Wallet, Plus, Minus, Trash2, 
  CheckCircle, Clock, ChevronRight, ChevronDown, ArrowLeft, Search, 
  Smartphone, BarChart3, ShoppingCart, BookOpen, RefreshCw, MessageSquare, 
  Flame, Send, Lock, PlusCircle, XCircle, DollarSign, X, TrendingUp, Bike, MapPin, Pencil
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, 
  updateDoc, addDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';


// ============================================================================
// 1. CONFIGURAÇÃO FIREBASE & DADOS DO MENU
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyC9ubZoHNEco7dJoRnjc6VVzO_l4YJ9zTU",
  authDomain: "gabriell-288a7.firebaseapp.com",
  projectId: "gabriell-288a7",
  storageBucket: "gabriell-288a7.firebasestorage.app",
  messagingSenderId: "743982878705",
  appId: "1:743982878705:web:39f4fdb248f006bef27e50"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = 'brasa-royal-prod';

const INITIAL_MENU_DATA = [
  { name: 'Duplo x-Tudo', price: 26.00, category: 'Lanches', active: true, description: 'Pão de brioche, 2 hambúrgueres, presunto, bacon, ovo, queijo muçarela, cheddar e alface' },
  { name: 'Duplo Bacon Costela', price: 26.00, category: 'Lanches', active: true, description: 'Pão de brioche, 2 hambúrgueres de costela, tiras de bacon, queijo muçarela e alface' },
  { name: 'Duplo Salada', price: 22.00, category: 'Lanches', active: true, description: 'Pão de brioche, 2 hambúrgueres, queijo muçarela, alface, tomate e maionese' },
  { name: 'Duplo Frango', price: 24.00, category: 'Lanches', active: true, description: 'Pão de brioche, 2 hambúrgueres de frango, queijo muçarela, alface, tomate e cheddar' },
  { name: 'Especial Brasa Royale', price: 16.00, category: 'Lanches', active: true, description: 'Receita exclusiva Brasa Royale' },
  { name: 'x-Burguer', price: 18.00, category: 'Lanches', active: true, description: 'Pão de brioche, hambúrguer, queijo cheddar, alface, tomate e maionese' },
  { name: 'x-Bacon', price: 14.00, category: 'Lanches', active: true, description: 'Pão de brioche, hambúrguer, tiras de bacon, queijo cheddar, cebola e alface' },
  { name: 'x-Calabresa', price: 20.00, category: 'Lanches', active: true, description: 'Pão de brioche, hambúrguer, fatias de calabresa, queijo muçarela e alface' },
  { name: 'x-Tudo', price: 20.00, category: 'Lanches', active: true, description: 'Pão de brioche, hambúrguer, presunto, bacon, ovo, queijo muçarela, cheddar e alface' },
  { name: 'Duplo Calabresa', price: 24.00, category: 'Lanches', active: true, description: 'Pão de brioche, 2 hambúrgueres, fatias de calabresa, queijo muçarela e alface' },
  { name: 'x-Salada', price: 14.00, category: 'Lanches', active: true, description: 'Pão de brioche, hambúrguer, queijo muçarela, alface, tomate e maionese' },
  { name: 'x-Frango', price: 18.00, category: 'Lanches', active: true, description: 'Pão de brioche, hambúrguer de frango, queijo muçarela, alface, tomate e cheddar' },
  { name: 'Duplo Bacon', price: 22.00, category: 'Lanches', active: true, description: 'Pão de brioche, 2 hambúrgueres, tiras de bacon, queijo cheddar, cebola e alface' },
  { name: 'Batata Frita Tradicional', price: 22.00, category: 'Porções', active: true, description: '350g de batata palito, acompanha molho barbecue' },
  { name: 'Batata, Cheddar e Bacon', price: 28.00, category: 'Porções', active: true, description: '350g com tiras de bacon e cobertura cheddar' },
  { name: 'Nuggets de Frango', price: 20.00, category: 'Porções', active: true, description: '10 unidades empanadas, acompanha molho barbecue' },
  { name: 'Refrigerante Cola 350ml', price: 8.00, category: 'Bebidas', active: true, description: 'Lata 350ml' },
  { name: 'Refrigerante Uva 350ml', price: 8.00, category: 'Bebidas', active: true, description: 'Lata 350ml' },
  { name: 'Bebida Cítrica 350ml', price: 8.00, category: 'Bebidas', active: true, description: 'Lata 350ml' },
  { name: 'Refrigerante Cola 2L', price: 18.00, category: 'Bebidas', active: true, description: 'Garrafa 2L' },
  { name: 'Cerveja Brasa Royale 600ml', price: 15.00, category: 'Bebidas', active: true, description: 'Long neck 600ml' },
  { name: 'Combo Fome Infinita', price: 156.00, category: 'Combos', active: true, description: '4 Duplos x-Tudo, 800g de fritas cheddar/bacon e 1 refri 2L' },
  { name: 'Combo Família', price: 170.00, category: 'Combos', active: true, description: '6 x-Burguers, 800g de fritas cheddar/bacon e 2 refris 2L' },
  { name: 'Combo Fome por 2', price: 65.00, category: 'Combos', active: true, description: '2 x-Burguers, 650g de fritas cheddar/bacon e 1 refri 2L' },
  { name: 'Combo Galera', price: 120.00, category: 'Combos', active: true, description: '4 x-Burguers, 1 porção de 30 nuggets e 1 refri 2L' },
  { name: 'Combo Família 2', price: 190.00, category: 'Combos', active: true, description: '6 x-Tudo, 800g de fritas cheddar/bacon e 2 refris 2L' },
  { name: 'Combo Brasa Royale', price: 205.00, category: 'Combos', active: true, description: '5 Especial Brasa Royal, 800g de fritas cheddar/bacon e 2 refris 2L' },
  { name: 'Caipirinha', price: 15.00, category: 'Drinques', active: true, description: 'Cachaça e suco de limão' },
  { name: 'Mojito', price: 20.00, category: 'Drinques', active: true, description: 'Rum, água com gás, suco de limão e hortelã' },
  { name: 'Piña Colada', price: 20.00, category: 'Drinques', active: true, description: 'Rum, leite de coco e suco de abacaxi' },
  { name: 'Cosmopolitan', price: 22.00, category: 'Drinques', active: true, description: 'Suco de limão, cranberry, licor de laranja e vodca' },
  { name: 'Bloody Mary', price: 25.00, category: 'Drinques', active: true, description: 'Vodca, tomate, limão, molho inglês e pimenta' }
];


// ============================================================================
// 2. COMPONENTES DE UI REUTILIZÁVEIS
// ============================================================================

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false }) => {
  const variants = {
    primary: 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border-2 border-orange-600 text-orange-600 hover:bg-orange-50'
  };
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    slate: 'bg-slate-100 text-slate-700'
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
};

const NavItem = ({ id, icon, label, currentView, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 flex-1 transition-all ${currentView === id ? 'text-orange-600' : 'text-slate-400'}`}>
    {React.cloneElement(icon, { className: `w-5 h-5 ${currentView === id ? 'animate-pulse' : ''}` })}
    <span className="text-[9px] font-black uppercase tracking-widest mt-1">{label}</span>
  </button>
);

const MenuCard = ({ onClick, icon, title, sub }) => (
  <button onClick={onClick} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all text-left w-full group">
    <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-orange-50 transition-colors">
      {icon}
    </div>
    <p className="font-black text-slate-800 text-sm leading-tight">{title}</p>
    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">{sub}</p>
  </button>
);


// ============================================================================
// 3. ECRÃS PRINCIPAIS DA APLICAÇÃO
// ============================================================================

const HomeView = ({ setCurrentView, setSelectedTable, setSelectedDelivery, setIsAuthorized, createInitialData, tableCountToCreate, setTableCountToCreate, tables, hasOccupiedTables, isGenerating }) => (
  <div className="p-6 space-y-8 animate-in fade-in duration-500">
    <div className="flex flex-col items-center pt-6 pb-2">
      <div className="w-48 h-48 rounded-full border-4 border-slate-900 shadow-2xl overflow-hidden mb-2 flex items-center justify-center bg-black relative">
        <img src="/logo.jpg" alt="Brasa Royale" className="w-full h-full object-cover scale-[1.4] relative z-10" onError={(e) => { e.target.style.display = 'none'; }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
          <Flame className="text-orange-500 w-16 h-16 animate-pulse" />
        </div>
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mt-3">Brasa Royale</h1>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Gestão Real-Time</p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <MenuCard onClick={() => { setCurrentView('order_entry'); setSelectedTable(null); setSelectedDelivery(null); }} icon={<PlusCircle className="text-orange-600 w-7 h-7"/>} title="Novo Pedido" sub="Vários Itens" />
      <MenuCard onClick={() => setCurrentView('tables')} icon={<Smartphone className="text-blue-600 w-7 h-7"/>} title="Salão" sub={`${tables.length} Mesas Ativas`} />
      <MenuCard onClick={() => setCurrentView('delivery')} icon={<Bike className="text-purple-600 w-7 h-7"/>} title="Delivery" sub="Entregas Rápidas" />
      <MenuCard onClick={() => setCurrentView('kitchen')} icon={<ChefHat className="text-emerald-600 w-7 h-7"/>} title="Cozinha" sub="Fila da Brasa" />
      <MenuCard onClick={() => setCurrentView('reports')} icon={<BarChart3 className="text-slate-500 w-7 h-7"/>} title="Caixa" sub="Controle Saídas" />
      <MenuCard onClick={() => { setCurrentView('products'); setIsAuthorized(false); }} icon={<BookOpen className="text-amber-500 w-7 h-7"/>} title="Menu" sub="Gerir Cardápio" />
    </div>
    
    <div className="pt-4 border-t border-slate-200">
      {tables.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm">
           <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Sistema Não Iniciado</span>
           <div className="flex items-center gap-2 w-full">
             <select 
               value={tableCountToCreate} 
               onChange={(e) => setTableCountToCreate(Number(e.target.value))} 
               className="bg-slate-50 text-orange-600 border border-slate-100 font-black text-sm px-4 py-3 rounded-2xl outline-none flex-1"
               disabled={isGenerating}
             >
               {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Mesas</option>)}
             </select>
             <Button disabled={isGenerating} onClick={() => createInitialData(tableCountToCreate)} className="flex-1 py-3">
                {isGenerating ? 'A GERAR...' : 'GERAR MESAS'}
             </Button>
           </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/50">
             <span className="text-[9px] font-black uppercase text-slate-500 pl-2 tracking-widest">Qtd. Mesas:</span>
             <select 
               value={tableCountToCreate} 
               onChange={(e) => setTableCountToCreate(Number(e.target.value))} 
               className="bg-white text-orange-600 font-black text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer shadow-sm disabled:opacity-50"
               disabled={hasOccupiedTables || isGenerating}
             >
               {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
             </select>
          </div>
          
          {hasOccupiedTables ? (
             <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest text-center px-4 flex items-center justify-center gap-1">
               <XCircle className="w-3 h-3" /> Feche as contas para reiniciar
             </p>
          ) : (
            <button disabled={isGenerating} onClick={() => createInitialData(tableCountToCreate)} className="text-slate-400 text-[9px] font-bold uppercase flex items-center justify-center gap-2 hover:text-slate-600 transition-colors mx-auto disabled:opacity-50">
              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /> 
              {isGenerating ? 'A RESTAURAR...' : `Restaurar para ${tableCountToCreate} Mesas`}
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);

const PasswordGate = ({ onAuthorized, onBack }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (input === '12345678') {
      onAuthorized();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 animate-in fade-in zoom-in duration-300">
      <div className="bg-orange-100 p-5 rounded-full mb-6">
        <Lock className="w-8 h-8 text-orange-600" />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Acesso Restrito</h2>
      <p className="text-slate-400 text-[10px] font-bold uppercase mb-10 tracking-widest text-center">Gestão Brasa Royale</p>
      <div className="w-full space-y-4">
        <input 
          type="password" 
          placeholder="SENHA" 
          className={`w-full bg-white border-2 p-5 rounded-[24px] text-center text-2xl font-black focus:outline-none transition-all ${error ? 'border-red-500 animate-pulse' : 'border-slate-100 focus:border-orange-500'}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        {error && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest">Senha Incorreta</p>}
        <Button onClick={handleSubmit} className="w-full py-5 text-sm tracking-widest uppercase">Aceder ao Painel</Button>
        <button onClick={onBack} className="w-full text-slate-400 text-[9px] font-black uppercase py-4">Voltar ao Início</button>
      </div>
    </div>
  );
};

const DeliveryView = ({ orders, onNewDelivery, onOpenDelivery, onBack }) => {
  const activeDeliveries = orders.filter(o => o.orderType === 'delivery' && o.status === 'open').sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  const [isCreating, setIsCreating] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const handleCreate = () => {
    if (!customerName || !customerAddress) return;
    onNewDelivery({ name: customerName, address: customerAddress, isNew: true });
    setIsCreating(false);
    setCustomerName('');
    setCustomerAddress('');
  };

  return (
    <div className="p-6 pb-32 animate-in fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-slate-400"/></button>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight text-shadow-sm">Delivery</h2>
        </div>
        <Button onClick={() => setIsCreating(true)} className="p-2.5 px-4"><Plus className="w-5 h-5 mr-1"/> Novo</Button>
      </div>

      {isCreating && (
        <Card className="p-6 mb-8 border-2 border-orange-500 shadow-2xl animate-in slide-in-from-top">
          <h3 className="font-black text-xs uppercase mb-5 text-orange-600 tracking-widest flex items-center gap-2"><Bike className="w-4 h-4"/> Nova Entrega</h3>
          <input type="text" placeholder="Nome do Cliente" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-slate-50 border-none p-4 rounded-2xl mb-3 text-sm focus:ring-2 shadow-inner outline-none" />
          <textarea placeholder="Endereço Completo (Rua, Bairro, Referência)" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-slate-50 border-none p-4 rounded-2xl mb-5 text-sm h-24 shadow-inner outline-none resize-none" />
          <div className="flex gap-3">
            <Button onClick={handleCreate} className="flex-1 py-4 text-xs tracking-widest uppercase">Iniciar Pedido</Button>
            <Button onClick={() => setIsCreating(false)} variant="secondary" className="flex-1 py-4 text-xs tracking-widest uppercase">Cancelar</Button>
          </div>
        </Card>
      )}

      {activeDeliveries.length === 0 && !isCreating ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[40px] border border-slate-100 shadow-sm">
           <Bike className="w-12 h-12 text-slate-200 mb-4" />
           <p className="text-slate-400 font-bold text-sm mb-6 text-center px-10">Nenhum delivery em andamento.</p>
           <Button onClick={() => setIsCreating(true)}>CRIAR NOVO DELIVERY</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeDeliveries.map(d => (
            <div key={d.id} onClick={() => onOpenDelivery(d)} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:border-orange-300 cursor-pointer transition-all active:scale-95">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-orange-100 p-2 rounded-xl text-orange-600"><Bike className="w-4 h-4"/></div>
                  <h3 className="font-black text-slate-800">{String(d.customerName || '')}</h3>
                </div>
                <Badge color="orange">R$ {Number(d.total || 0).toFixed(2)}</Badge>
              </div>
              <div className="flex items-start gap-2 text-slate-500 mb-4">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 opacity-50" />
                <p className="text-[11px] leading-snug line-clamp-2">{String(d.customerAddress || '')}</p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                 <span className="text-[10px] font-black uppercase text-slate-400">{d.items?.length || 0} ITENS</span>
                 <span className="text-[10px] font-black uppercase text-orange-600 flex items-center gap-1">ABRIR PEDIDO <ChevronRight className="w-3 h-3"/></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TablesView = ({ tables, onSelectTable, onBack, onRestore, tableCountToCreate, setTableCountToCreate, isGenerating }) => {
  const areAllFree = tables.length > 0 && tables.every(t => t.status === 'free');

  return (
    <div className="p-6 pb-32 animate-in fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-slate-400"/></button>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight text-shadow-sm">Mapa do Salão</h2>
        </div>
        <Badge color="slate">{tables.length} Mesas</Badge>
      </div>

      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[40px] border border-slate-100 shadow-sm">
           <Smartphone className="w-12 h-12 text-slate-200 mb-4" />
           <p className="text-slate-400 font-bold text-sm mb-6 text-center px-10">As mesas não foram detectadas no sistema.</p>
           
           <div className="flex items-center gap-3 mb-6 bg-slate-50 p-2 rounded-2xl border border-slate-100">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-3">Quantidade:</span>
             <select 
               value={tableCountToCreate} 
               onChange={e => setTableCountToCreate(Number(e.target.value))}
               className="bg-white text-orange-600 rounded-xl px-4 py-2 text-sm font-black outline-none shadow-sm cursor-pointer disabled:opacity-50"
               disabled={isGenerating}
             >
               {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
             </select>
           </div>

           <Button disabled={isGenerating} onClick={() => onRestore(tableCountToCreate)}>
             {isGenerating ? 'A GERAR...' : `GERAR ${tableCountToCreate} MESAS`}
           </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-5">
            {tables.map(t => (
              <div key={t.id} onClick={() => onSelectTable(t)} className={`aspect-square flex flex-col items-center justify-center border-2 rounded-[32px] cursor-pointer active:scale-95 transition-all shadow-sm ${t.status === 'free' ? 'bg-white border-slate-100 text-emerald-600 hover:border-emerald-200' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                <span className="text-4xl font-black">{t.number}</span>
                <span className="text-[10px] font-black uppercase mt-1 tracking-widest">{t.status === 'free' ? 'Livre' : 'Ocupada'}</span>
              </div>
            ))}
          </div>

          {areAllFree && (
            <div className="mt-12 pt-8 border-t border-slate-200 text-center animate-in slide-in-from-bottom">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Ação de Fim de Expediente</p>
               
               <div className="flex items-center justify-center gap-3 mb-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 mx-auto w-fit">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-3">Qtd:</span>
                 <select 
                   value={tableCountToCreate} 
                   onChange={e => setTableCountToCreate(Number(e.target.value))}
                   className="bg-white text-orange-600 rounded-xl px-4 py-2 text-sm font-black outline-none shadow-sm cursor-pointer disabled:opacity-50"
                   disabled={isGenerating}
                 >
                   {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                 </select>
               </div>

               <Button variant="outline" disabled={isGenerating} onClick={() => onRestore(tableCountToCreate)} className="w-full">
                  <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} /> 
                  {isGenerating ? 'A RESTAURAR...' : `Restaurar para ${tableCountToCreate} Mesas`}
               </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const KitchenView = ({ orders, onBack, onUpdateStatus }) => {
  const pendingItems = orders.filter(o => o.status === 'open').flatMap(o => 
    (o.items || []).map((it, idx) => ({ 
      ...it, 
      orderId: o.id, 
      table: o.tableNumber, 
      orderType: o.orderType || 'table',
      customerName: o.customerName || '',
      itemIdx: idx 
    }))
  ).filter(it => it.status !== 'ready' && it.category !== 'Bebidas').sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0));

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white pb-32 animate-in fade-in">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft className="text-slate-400 hover:text-white"/></button>
        <h2 className="text-2xl font-black uppercase tracking-tighter">Cozinha Brasa</h2>
      </div>
      <div className="space-y-4">
        {pendingItems.map((it, i) => (
          <div key={i} className={`bg-slate-800 rounded-2xl shadow-xl border-l-8 p-6 ${it.status === 'preparing' ? 'border-orange-500' : 'border-blue-500'}`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-3xl font-black text-orange-500 tracking-tighter leading-none">
                {it.orderType === 'delivery' ? `🛵 ${String(it.customerName).split(' ')[0]}` : `Mesa ${it.table}`}
              </span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${it.status === 'preparing' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {it.status === 'pending' ? 'AGUARDANDO' : 'PREPARANDO'}
              </span>
            </div>
            <h3 className="text-xl font-black text-white uppercase mb-1 leading-tight">{Number(it.qty) || 1}x {String(it.name || 'Item')}</h3>
            {it.description && <p className="text-slate-400 text-[11px] mb-4 leading-tight italic line-clamp-2">{String(it.description)}</p>}
            
            {it.obs && typeof it.obs === 'string' && <p className="bg-red-500/20 text-red-400 p-3 rounded-2xl text-[11px] font-bold mb-6 border border-red-500/30">⚠️ OBS: {it.obs}</p>}
            
            <div className="flex gap-3 mt-4">
              {it.status === 'pending' ? (
                <button onClick={() => onUpdateStatus(it.orderId, it.itemIdx, 'preparing')} className="flex-1 py-4 rounded-xl font-bold border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 transition-colors uppercase tracking-widest text-xs">PREPARAR</button>
              ) : (
                <button onClick={() => onUpdateStatus(it.orderId, it.itemIdx, 'ready')} className="flex-1 py-4 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/50 uppercase tracking-widest text-xs">PRONTO</button>
              )}
            </div>
          </div>
        ))}
        {pendingItems.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed border-slate-700 rounded-[40px] bg-slate-800/50">
            <Flame className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">A Brasa está livre.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductsManager = ({ products, onBack, onSave, onEdit, onToggleActive, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [item, setItem] = useState({ name: '', price: '', category: 'Lanches', description: '', active: true });

  const submitSave = () => {
    if (!item.name || !item.price) return;
    if (editingId) {
      onEdit(editingId, item);
    } else {
      onSave(item);
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setItem({ name: '', price: '', category: 'Lanches', description: '', active: true });
  };

  const openEdit = (prod) => {
    setItem({ 
      name: prod.name || '', 
      price: prod.price || '', 
      category: prod.category || 'Lanches', 
      description: prod.description || '', 
      active: prod.active !== false 
    });
    setEditingId(prod.id);
    setIsAdding(true);
  };

  return (
    <div className="p-6 pb-32 animate-in fade-in">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-slate-400"/></button>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gerir Menu</h2>
        </div>
        <Button onClick={() => { cancelEdit(); setIsAdding(true); }} className="p-3"><Plus className="w-6 h-6"/></Button>
      </div>
      
      {isAdding && (
        <Card className="p-8 mb-10 border-2 border-orange-500 shadow-2xl animate-in zoom-in">
          <h3 className="font-black text-xs uppercase mb-6 text-orange-600 tracking-widest text-center">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
          <input className="w-full bg-slate-50 border-none p-4 rounded-2xl mb-4 text-sm focus:ring-2 shadow-inner outline-none" placeholder="Nome" value={item.name} onChange={e => setItem({...item, name: e.target.value})} />
          <div className="flex gap-4 mb-4">
            <input type="number" className="w-1/2 bg-slate-50 border-none p-4 rounded-2xl text-sm shadow-inner outline-none" placeholder="R$ Preço" value={item.price} onChange={e => setItem({...item, price: e.target.value})} />
            <select className="w-1/2 bg-slate-50 border-none p-4 rounded-2xl text-sm shadow-inner outline-none" value={item.category} onChange={e => setItem({...item, category: e.target.value})}>
              <option>Lanches</option><option>Porções</option><option>Bebidas</option><option>Combos</option><option>Drinques</option>
            </select>
          </div>
          <textarea className="w-full bg-slate-50 border-none p-4 rounded-2xl mb-8 text-sm h-28 shadow-inner outline-none resize-none" placeholder="Descrição..." value={item.description} onChange={e => setItem({...item, description: e.target.value})} />
          <div className="flex gap-4">
            <Button onClick={submitSave} className="flex-1 py-4 uppercase tracking-widest text-xs">{editingId ? 'ATUALIZAR' : 'SALVAR'}</Button>
            <Button onClick={cancelEdit} variant="secondary" className="flex-1 py-4 uppercase tracking-widest text-xs">Cancelar</Button>
          </div>
        </Card>
      )}
      
      <div className="space-y-4">
        {products.sort((a,b) => String(a.category || '').localeCompare(String(b.category || ''))).map(p => (
          <div key={p.id} className="bg-white p-5 rounded-[32px] border border-slate-100 flex justify-between items-center shadow-sm">
            <div className="flex-1 pr-5">
              <p className={`font-black text-sm ${p.active ? 'text-slate-900' : 'text-slate-300 line-through'}`}>{String(p.name || 'Produto')}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{String(p.category || 'Outros')} • R$ {Number(p.price || 0).toFixed(2)}</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => openEdit(p)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-blue-500 transition-colors"><Pencil className="w-4 h-4"/></button>
              <button onClick={() => onToggleActive(p.id, p.active)} className={`p-3 rounded-2xl transition-all ${p.active ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}><CheckCircle className="w-4 h-4"/></button>
              <button onClick={() => onDelete(p.id)} className="p-3 bg-slate-50 text-red-300 hover:text-red-500 rounded-2xl transition-colors"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderEntryView = ({ selectedTable, selectedDelivery, activeOrder, products, cart, setCart, onBack, onFinalize, onDeleteTableItem, onOpenTableSelector, onBill }) => {
  const cats = ['Lanches', 'Porções', 'Bebidas', 'Combos', 'Drinques'];
  const [activeCat, setActiveCat] = useState('Lanches');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartExpanded, setIsCartExpanded] = useState(false);

  // Monitorização estável para fecho automático do carrinho
  useEffect(() => {
    if (cart.length === 0 && isCartExpanded) {
      setIsCartExpanded(false);
    }
  }, [cart.length, isCartExpanded]);

  const filtered = products.filter(p => p.active && (String(p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || String(p.category || '').toLowerCase().includes(searchTerm.toLowerCase())));

  const handleAddToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { id: product.id, name: product.name, price: product.price, category: product.category, qty: 1, obs: '', description: product.description }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === productId);
      if (exists && exists.qty > 1) return prev.map(item => item.id === productId ? { ...item, qty: item.qty - 1 } : item);
      return prev.filter(item => item.id !== productId);
    });
  };

  const handleUpdateObs = (productId, newObs) => {
    setCart(prev => prev.map(item => item.id === productId ? { ...item, obs: newObs } : item));
  };

  const titleText = selectedTable ? `Mesa ${selectedTable.number}` : selectedDelivery ? `Delivery` : 'Novo Pedido';
  const subtitleText = selectedDelivery ? String(selectedDelivery.name).split(' ')[0] : '';

  return (
    <div className="flex flex-col h-screen bg-slate-50 animate-in fade-in">
      <div className="bg-white p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-500"><ArrowLeft className="w-6 h-6"/></button>
          <div>
             <h2 className="font-bold text-slate-800 text-lg leading-tight">{titleText}</h2>
             {subtitleText && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{subtitleText}</p>}
          </div>
        </div>
        {activeOrder && <div className="bg-orange-600 text-white px-3 py-1.5 rounded-xl shadow-lg animate-in slide-in-from-right"><p className="font-black text-xs">R$ {Number(activeOrder.total || 0).toFixed(2)}</p></div>}
      </div>
      <div className="p-4 bg-white border-b border-slate-100 space-y-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Pesquisar Produto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-100 text-slate-800 placeholder-slate-400 rounded-2xl py-3.5 pl-11 pr-4 text-sm border-none outline-none focus:ring-2 focus:ring-orange-500 transition-colors" /></div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{cats.map(c => (<button key={c} onClick={() => setActiveCat(c)} className={`px-6 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${activeCat === c ? 'bg-orange-600 text-white shadow-md shadow-orange-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{c}</button>))}</div>
      </div>
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${cart.length > 0 ? 'pb-32' : 'pb-24'}`}>
        {activeOrder && (activeOrder.items || []).length > 0 && (
          <div className="mb-6 space-y-3 bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4">Itens já lançados</h3>
            {(activeOrder.items || []).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-top">
                <div className="flex-1 pr-3"><p className="text-xs font-bold text-slate-700">{item.qty}x {String(item.name || 'Item')}</p></div>
                <button onClick={() => onDeleteTableItem(activeOrder.id, idx)} className="p-2.5 bg-white rounded-xl text-red-400 hover:text-red-600 shadow-sm border border-red-50 transition-all active:scale-90"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
        
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Cardápio</h3>
        {filtered.filter(p => p.category === activeCat || searchTerm).map(p => {
          const inCart = cart.find(i => i.id === p.id);
          return (
            <div key={p.id} onClick={() => handleAddToCart(p)} className={`flex items-center justify-between p-5 bg-white rounded-[32px] border transition-all active:scale-95 shadow-sm cursor-pointer ${inCart ? 'border-orange-500 bg-orange-50/50 shadow-orange-500/10' : 'border-slate-100 hover:border-slate-300'}`}>
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2"><p className={`font-black text-sm ${inCart ? 'text-orange-600' : 'text-slate-800'}`}>{String(p.name || '')}</p>{inCart && <span className="bg-orange-600 text-white text-[10px] px-2.5 py-0.5 rounded-lg font-black shadow-sm">{inCart.qty}</span>}</div>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-1">{String(p.description || '')}</p>
              </div>
              <div className="text-right"><p className="font-black text-orange-600 text-xs">R$ {Number(p.price || 0).toFixed(2)}</p><div className={`mt-2 p-1.5 rounded-xl inline-block transition-colors ${inCart ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Plus className="w-4 h-4" /></div></div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <>
          {isCartExpanded && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 animate-in fade-in" onClick={() => setIsCartExpanded(false)} />}
          
          <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 shadow-[0_-15px_60px_rgba(0,0,0,0.15)] z-40 transition-all duration-300 flex flex-col rounded-t-[40px] ${isCartExpanded ? 'h-[85vh]' : 'h-auto'}`}>
            
            <div className="p-5 flex justify-between items-center cursor-pointer active:bg-slate-50 rounded-t-[40px]" onClick={() => setIsCartExpanded(!isCartExpanded)}>
              <div className="flex items-center gap-4">
                <div className="relative bg-orange-100 p-3 rounded-2xl">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                    {cart.reduce((a,b)=>a+(Number(b.qty)||0),0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carrinho</span>
                  <span className="font-black text-2xl text-orange-600 tracking-tighter leading-none">
                    R$ {cart.reduce((a,b)=>a+((Number(b.price)||0)*(Number(b.qty)||0)),0).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isCartExpanded ? (
                  <span className="bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl">Revisar</span>
                ) : (
                  <button className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><ChevronDown className="w-5 h-5"/></button>
                )}
              </div>
            </div>

            {isCartExpanded && (
              <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col animate-in slide-in-from-bottom-8">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide mb-6">
                  {cart.map(i => (
                    <div key={i.id} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-black text-slate-800">{String(i.name || '')}</span>
                        <div className="flex items-center gap-4">
                          <button onClick={(e) => { e.stopPropagation(); handleRemoveFromCart(i.id); }} className="p-2 bg-white rounded-xl border border-red-100 text-red-500 active:scale-90"><Minus className="w-3 h-3"/></button>
                          <span className="text-sm font-black text-slate-800">{i.qty}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleAddToCart(i); }} className="p-2 bg-white rounded-xl border border-emerald-100 text-emerald-500 active:scale-90"><Plus className="w-3 h-3"/></button>
                        </div>
                      </div>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input type="text" placeholder="Observações..." value={i.obs} onChange={(e) => handleUpdateObs(i.id, e.target.value)} className="w-full bg-white text-slate-700 placeholder-slate-400 border border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-[11px] outline-none focus:border-orange-300" />
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={() => { setIsCartExpanded(false); if (selectedTable || selectedDelivery) onFinalize(selectedTable, selectedDelivery); else onOpenTableSelector(); }} className="w-full py-5 text-lg uppercase shadow-xl shadow-orange-500/30">
                  <Send className="w-5 h-5 mr-2" /> {selectedTable ? `Lançar Mesa ${selectedTable.number}` : selectedDelivery ? `Lançar Delivery` : 'Finalizar'}
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {(selectedTable || selectedDelivery) && (activeOrder?.status === 'open') && cart.length === 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 flex gap-3 z-10 rounded-t-[40px] shadow-[0_-15px_50px_rgba(0,0,0,0.1)]">
          <Button onClick={onBill} className="flex-1 py-5 text-sm font-black uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 shadow-xl border-none">
            FECHAR CONTA / PAGAMENTO
          </Button>
        </div>
      )}
    </div>
  );
};

const ReportsView = ({ orders, onBack }) => {
  const [reportPeriod, setReportPeriod] = useState('day');

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfDay - (now.getDay() * 86400000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const closedOrders = orders.filter(o => o.status === 'closed');
  
  const filteredOrders = closedOrders.filter(o => {
    let time = 0;
    if (o.closedAt && o.closedAt.seconds) time = o.closedAt.seconds * 1000;
    else if (typeof o.closedAt === 'number') time = o.closedAt;
    else return true; 

    if (reportPeriod === 'day') return time >= startOfDay;
    if (reportPeriod === 'week') return time >= startOfWeek;
    if (reportPeriod === 'month') return time >= startOfMonth;
    return true;
  });

  const periodRevenue = filteredOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const periodCount = filteredOrders.length;
  const periodAvg = periodCount > 0 ? periodRevenue / periodCount : 0;

  const itemTotals = {};
  filteredOrders.forEach(o => {
    (o.items || []).forEach(i => {
      const name = typeof i.name === 'string' ? i.name : 'Desconhecido';
      if (!itemTotals[name]) itemTotals[name] = { qty: 0, revenue: 0 };
      itemTotals[name].qty += (Number(i.qty) || 0);
      itemTotals[name].revenue += ((Number(i.qty) || 0) * (Number(i.price) || 0));
    });
  });
  const popularItems = Object.entries(itemTotals).sort((a,b) => b[1].qty - a[1].qty).map(([name, data]) => ({ name, ...data }));

  return (
    <div className="p-6 pb-32 animate-in fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft className="w-6 h-6 text-slate-500"/></button>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Controle de Saídas</h2>
      </div>
      
      <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-2xl mb-8 overflow-x-auto scrollbar-hide">
        {[{id:'day', label:'Hoje'}, {id:'week', label:'Semana'}, {id:'month', label:'Mês'}, {id:'all', label:'Geral'}].map(p => (
          <button key={p.id} onClick={() => setReportPeriod(p.id)} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${reportPeriod === p.id ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:bg-white/50'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <Card className="bg-slate-900 text-white p-8 border-slate-800 col-span-2 shadow-xl shadow-slate-900/20 relative overflow-hidden">
          <div className="absolute -right-5 -top-5 opacity-10"><BarChart3 className="w-32 h-32 text-white" /></div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1 relative z-10">Faturamento do Período</p>
          <h3 className="text-4xl font-black mt-1 text-orange-500 drop-shadow-sm relative z-10">R$ {periodRevenue.toFixed(2)}</h3>
        </Card>
        <Card className="p-6 text-center bg-white shadow-sm border-slate-100 rounded-[32px]"><p className="text-[10px] font-black uppercase text-slate-400">Total Vendas</p><h3 className="text-2xl font-black text-slate-800 mt-1">{periodCount}</h3></Card>
        <Card className="p-6 text-center bg-white shadow-sm border-slate-100 rounded-[32px]"><p className="text-[10px] font-black uppercase text-slate-400">Ticket Médio</p><h3 className="text-2xl font-black text-slate-800 mt-1">R$ {periodAvg.toFixed(2)}</h3></Card>
      </div>

      <div className="space-y-3 mb-10">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5 px-1 flex items-center gap-2"><TrendingUp className="w-3 h-3 text-orange-500"/> Produtos Vendidos</h4>
        {popularItems.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[32px] border border-slate-100 flex justify-between items-center shadow-sm">
            <div>
              <p className="font-black text-slate-800 text-sm">{String(item.name || '')}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.qty} {item.qty === 1 ? 'unidade' : 'unidades'} vendidas</p>
            </div>
            <span className="font-black text-orange-600 bg-orange-50 border border-orange-100 px-4 py-2 rounded-2xl shadow-inner">R$ {item.revenue.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BillView = ({ selectedTable, selectedDelivery, activeOrder, onBack, onPayment }) => {
  if ((!selectedTable && !selectedDelivery) || !activeOrder) return null;
  
  return (
    <div className="p-6 pb-32 animate-in fade-in bg-slate-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8"><button onClick={onBack} className="p-2 -ml-2 text-slate-500"><ArrowLeft className="w-6 h-6"/></button><h2 className="text-2xl font-black text-slate-800">{selectedTable ? `Mesa ${selectedTable.number}` : `Delivery`}</h2></div>
      
      <Card className="p-8 mb-8 border-dashed border-2 border-slate-200 bg-white relative shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-600"></div>
        <div className="text-center border-b border-slate-100 pb-8 mb-8">
           <h3 className="font-black text-2xl uppercase tracking-widest text-slate-900 italic">Brasa Royale</h3>
           <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Cupom de Consumo</p>
        </div>
        <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 scrollbar-hide">
          {(activeOrder?.items || []).map((i, idx) => (
            <div key={idx} className="flex justify-between border-b border-slate-50 pb-3">
              <div className="flex flex-col pr-4">
                <span className="text-slate-800 font-bold">{i.qty}x {String(i.name || 'Item')}</span>
                {i.obs && typeof i.obs === 'string' && <span className="text-[9px] text-orange-500 font-bold uppercase italic mt-1">({i.obs})</span>}
              </div>
              <span className="font-black text-slate-800">R$ {(Number(i.price||0) * Number(i.qty||1)).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-8 border-t-2 border-slate-100 flex justify-between items-center">
           <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Valor Total</span>
           <span className="text-orange-600 text-4xl font-black drop-shadow-sm">R$ {Number(activeOrder?.total || 0).toFixed(2)}</span>
        </div>
      </Card>
      
      <div className="space-y-3 mb-10">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 px-2">Pagamento</p>
        <button onClick={() => onPayment('Cartão')} className="w-full bg-white border border-slate-200 p-4 rounded-[24px] flex items-center gap-4 active:scale-95 shadow-sm group">
          <div className="bg-blue-50 p-4 rounded-2xl"><Wallet className="w-6 h-6 text-blue-600" /></div>
          <span className="font-black uppercase tracking-widest text-slate-700 text-sm">Cartão</span>
        </button>
        <button onClick={() => onPayment('PIX')} className="w-full bg-white border border-slate-200 p-4 rounded-[24px] flex items-center gap-4 active:scale-95 shadow-sm group">
          <div className="bg-emerald-50 p-4 rounded-2xl"><Smartphone className="w-6 h-6 text-emerald-600" /></div>
          <span className="font-black uppercase tracking-widest text-slate-700 text-sm">PIX</span>
        </button>
        <button onClick={() => onPayment('Dinheiro')} className="w-full bg-white border border-slate-200 p-4 rounded-[24px] flex items-center gap-4 active:scale-95 shadow-sm group">
          <div className="bg-orange-50 p-4 rounded-2xl"><DollarSign className="w-6 h-6 text-orange-600" /></div>
          <span className="font-black uppercase tracking-widest text-slate-700 text-sm">Dinheiro</span>
        </button>
      </div>
    </div>
  );
};


// ============================================================================
// 4. APLICAÇÃO PRINCIPAL (ESTADOS E LOGICA)
// ============================================================================

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); 
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [cart, setCart] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSelectingTableForQuickOrder, setIsSelectingTableForQuickOrder] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [tableCountToCreate, setTableCountToCreate] = useState(5);
  const [globalError, setGlobalError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Inicialização Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) { 
        setGlobalError("Bloqueio de Auth: Verifique o método 'Anónimo' no Firebase.");
        setUser({ uid: 'offline-user', isAnonymous: true });
      } finally { 
        setIsInitialLoading(false); 
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => { if (firebaseUser) setUser(firebaseUser); });
    return () => unsubscribe();
  }, []);

  // Listeners Firebase
  useEffect(() => {
    if (!user) return;
    const handleError = (error) => { console.error(error); setGlobalError(`Erro de conexão com o banco de dados.`); };
    const unsubTables = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'tables'), (snap) => {
      setTables(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => a.number - b.number));
    }, handleError);
    const unsubProducts = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, handleError);
    const unsubOrders = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, handleError);
    return () => { unsubTables(); unsubProducts(); unsubOrders(); };
  }, [user]);

  // Estado Derivado do Pedido Ativo
  const activeOrder = useMemo(() => {
    if (selectedTable?.currentOrderId) return orders.find(o => o.id === selectedTable.currentOrderId && o.status === 'open');
    if (selectedDelivery && !selectedDelivery.isNew) return orders.find(o => o.id === selectedDelivery.id && o.status === 'open');
    return null;
  }, [selectedTable, selectedDelivery, orders]);

  // Funções Globais
  const createInitialData = async (count = 5) => {
    if (!user) return;
    if (tables.some(t => t.status === 'occupied')) return;
    setIsGenerating(true); setGlobalError('');
    try {
      const deletePromises = tables.map(t => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tables', t.id)));
      await Promise.all(deletePromises);
      for (let i = 1; i <= count; i++) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tables', `table-${i}`), { number: i, status: 'free', currentOrderId: null });
      }
      if (products.length === 0) {
        for (const p of INITIAL_MENU_DATA) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), p);
      }
    } catch (e) { setGlobalError(`Falha ao gravar dados no Firebase.`); }
    finally { setIsGenerating(false); }
  };

  const finalizeOrderOnTable = async (targetTable, targetDelivery) => {
    if (!user || cart.length === 0) return;
    try {
      const itemsToAdd = cart.map(item => ({ ...item, status: 'pending', createdAt: Date.now() }));
      const totalCart = cart.reduce((acc, curr) => acc + ((Number(curr.price)||0) * (Number(curr.qty)||1)), 0);
      if (targetDelivery) {
        if (targetDelivery.isNew) {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), { orderType: 'delivery', customerName: targetDelivery.name, customerAddress: targetDelivery.address, status: 'open', items: itemsToAdd, total: totalCart, createdAt: serverTimestamp() });
        } else {
           const order = orders.find(o => o.id === targetDelivery.id);
           const updatedItems = [...(order.items || []), ...itemsToAdd];
           await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', targetDelivery.id), { items: updatedItems, total: updatedItems.reduce((acc, curr) => acc + ((Number(curr.price)||0) * (Number(curr.qty)||1)), 0) });
        }
        setCart([]); setSelectedDelivery(null); setCurrentView('delivery');
      } else if (targetTable) {
        let orderId = targetTable.currentOrderId;
        if (!orderId) {
          const orderRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), { tableId: targetTable.id, tableNumber: targetTable.number, status: 'open', items: itemsToAdd, total: totalCart, createdAt: serverTimestamp() });
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tables', targetTable.id), { status: 'occupied', currentOrderId: orderRef.id });
        } else {
          const order = orders.find(o => o.id === orderId);
          const updatedItems = [...(order.items || []), ...itemsToAdd];
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { items: updatedItems, total: updatedItems.reduce((acc, curr) => acc + ((Number(curr.price)||0) * (Number(curr.qty)||1)), 0) });
        }
        setCart([]); setSelectedTable(null); setCurrentView('tables');
      }
    } catch (e) { console.error(e); }
  };

  const handlePayment = async (method) => {
    if (!activeOrder) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', activeOrder.id), { status: 'closed', paymentMethod: method, closedAt: serverTimestamp() });
      if (selectedTable) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tables', selectedTable.id), { status: 'free', currentOrderId: null });
        setSelectedTable(null); setCurrentView('tables');
      } else if (selectedDelivery) {
        setSelectedDelivery(null); setCurrentView('delivery');
      }
    } catch(e) { setGlobalError("Erro ao fechar conta."); }
  };

  const renderView = () => {
    switch(currentView) {
      case 'home': return <HomeView setCurrentView={setCurrentView} setSelectedTable={setSelectedTable} setSelectedDelivery={setSelectedDelivery} setIsAuthorized={setIsAuthorized} createInitialData={createInitialData} tableCountToCreate={tableCountToCreate} setTableCountToCreate={setTableCountToCreate} tables={tables} hasOccupiedTables={tables.some(t => t.status === 'occupied')} isGenerating={isGenerating} />;
      case 'tables': return <TablesView tables={tables} onSelectTable={(t) => { setSelectedTable(t); setSelectedDelivery(null); setCurrentView('order_entry'); }} onBack={() => setCurrentView('home')} onRestore={createInitialData} tableCountToCreate={tableCountToCreate} setTableCountToCreate={setTableCountToCreate} isGenerating={isGenerating} />;
      case 'delivery': return <DeliveryView orders={orders} onNewDelivery={(c) => { setSelectedDelivery(c); setSelectedTable(null); setCurrentView('order_entry'); }} onOpenDelivery={(d) => { setSelectedDelivery(d); setSelectedTable(null); setCurrentView('order_entry'); }} onBack={() => setCurrentView('home')} />;
      case 'order_entry': return <OrderEntryView selectedTable={selectedTable} selectedDelivery={selectedDelivery} activeOrder={activeOrder} products={products} cart={cart} setCart={setCart} onBack={() => { setCurrentView(selectedTable ? 'tables' : (selectedDelivery ? 'delivery' : 'home')); setCart([]); setSelectedTable(null); setSelectedDelivery(null); }} onFinalize={finalizeOrderOnTable} onDeleteTableItem={async (id, idx) => { const order = orders.find(o => o.id === id); const newItems = order.items.filter((_, i) => i !== idx); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { items: newItems, total: newItems.reduce((acc, curr) => acc + ((Number(curr.price)||0) * (Number(curr.qty)||1)), 0) }); }} onOpenTableSelector={() => setIsSelectingTableForQuickOrder(true)} onBill={() => setCurrentView('bill')} />;
      case 'kitchen': return <KitchenView orders={orders} onBack={() => setCurrentView('home')} onUpdateStatus={async (oId, idx, next) => { const order = orders.find(o => o.id === oId); const newItems = [...order.items]; newItems[idx].status = next; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', oId), { items: newItems }); }} />;
      case 'products': return isAuthorized ? <ProductsManager products={products} onBack={() => setCurrentView('home')} onSave={(item) => addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), { ...item, price: parseFloat(item.price) })} onEdit={async (id, item) => await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id), { ...item, price: parseFloat(item.price) })} onToggleActive={async (id, current) => await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id), { active: !current })} onDelete={async (id) => await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id))} /> : <PasswordGate onAuthorized={() => setIsAuthorized(true)} onBack={() => setCurrentView('home')} />;
      case 'reports': return <ReportsView orders={orders} onBack={() => setCurrentView('home')} />;
      case 'bill': return <BillView selectedTable={selectedTable} selectedDelivery={selectedDelivery} activeOrder={activeOrder} onBack={() => setCurrentView('order_entry')} onPayment={handlePayment} />;
      default: return null;
    }
  };

  if (isInitialLoading) return <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900"><Flame className="w-16 h-16 animate-bounce mb-4 text-orange-600" /><h1 className="text-4xl font-black tracking-tighter uppercase italic">Brasa Royale</h1></div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 shadow-2xl relative font-sans text-slate-900 overflow-x-hidden selection:bg-orange-100">
      {globalError && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-red-500 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center border border-red-400">
          <span className="text-xs font-bold flex-1 mr-4">{globalError}</span>
          <button onClick={() => setGlobalError('')} className="p-1 bg-black/10 rounded-full"><X className="w-4 h-4"/></button>
        </div>
      )}
      {renderView()}
      {['home', 'tables', 'kitchen', 'reports', 'delivery', 'products'].includes(currentView) && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around p-3 pb-8 z-40 rounded-t-[40px] shadow-[0_-15px_50px_rgba(0,0,0,0.1)]">
          <NavItem id="home" icon={<LayoutDashboard />} label="Início" currentView={currentView} onClick={() => { setCurrentView('home'); setSelectedTable(null); setSelectedDelivery(null); }} />
          <NavItem id="tables" icon={<Smartphone />} label="Salão" currentView={currentView} onClick={() => { setCurrentView('tables'); setSelectedTable(null); setSelectedDelivery(null); }} />
          <NavItem id="delivery" icon={<Bike />} label="Delivery" currentView={currentView} onClick={() => { setCurrentView('delivery'); setSelectedTable(null); setSelectedDelivery(null); }} />
          <NavItem id="kitchen" icon={<ChefHat />} label="Brasa" currentView={currentView} onClick={() => { setCurrentView('kitchen'); setSelectedTable(null); setSelectedDelivery(null); }} />
          <NavItem id="reports" icon={<BarChart3 />} label="Caixa" currentView={currentView} onClick={() => { setCurrentView('reports'); setSelectedTable(null); setSelectedDelivery(null); }} />
        </div>
      )}
      {isSelectingTableForQuickOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-end">
            <div className="bg-white w-full max-w-md mx-auto rounded-t-[50px] p-10 pb-16 shadow-2xl border-t border-slate-100">
              <div className="flex justify-between items-center mb-10"><h3 className="text-2xl font-black uppercase italic text-slate-900">Qual a Mesa?</h3><button onClick={() => setIsSelectingTableForQuickOrder(false)} className="bg-slate-100 p-3 rounded-full"><X className="w-5 h-5 text-slate-500" /></button></div>
              <div className="grid grid-cols-5 gap-4">
                {tables.map(t => (<button key={t.id} onClick={() => { finalizeOrderOnTable(t, null); setIsSelectingTableForQuickOrder(false); }} className={`aspect-square rounded-[24px] border border-slate-100 flex flex-col items-center justify-center transition-all ${t.status === 'free' ? 'bg-slate-50 text-emerald-600' : 'bg-orange-50 text-orange-600 border-orange-200'}`}><span className="font-black text-xl">{t.number}</span></button>))}
              </div>
            </div>
          </div>
      )}
    </div>
  );
}
