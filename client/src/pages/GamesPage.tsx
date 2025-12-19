import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, List, LayoutGrid, Clock, TrendingUp, Filter, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useMatchData, Match } from '@/hooks/useMatchData';
import { format } from 'date-fns';

// Componente para exibir um único jogo em formato de lista
function MatchListItem({ match }: { match: Match }) {
  // Lógica de validação: verifica se todos os pools reais atingiram o valor mínimo (Seed Virtual)
  const isHomeValidated = match.realPoolHome >= match.minPoolHome;
  const isDrawValidated = match.realPoolDraw >= match.minPoolDraw;
  const isAwayValidated = match.realPoolAway >= match.minPoolAway;
  const isFullyValidated = isHomeValidated && isDrawValidated && isAwayValidated;

  // Função para calcular o progresso do pool (para a barra)
  const calculateProgress = (real: number, min: number) => Math.min(100, (real / min) * 100);

  return (
    <Card className="p-4 bg-gray-900 border-gray-700 hover:border-primary/50 transition-colors cursor-pointer">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Times e Campeonato (Col 1-4) */}
        <div className="md:col-span-4">
          <p className="text-lg font-bold text-white">{match.homeTeam} vs {match.awayTeam}</p>
          <p className="text-sm text-white/70">{match.league}</p>
        </div>

        {/* Início (Col 5-6) */}
        <div className="md:col-span-2 text-center">
          <p className="text-sm text-white/70">Início</p>
          <p className="text-base font-bold text-white">{format(match.startTime, 'dd/MM HH:mm')}</p>
        </div>

        {/* Odds Dinâmicas (Col 7-9) */}
        <div className="md:col-span-3 flex justify-around text-center">
          <div>
            <p className="text-xs text-white/70">Casa</p>
            <p className="text-lg font-bold text-green-400">{(match.dynamicOddsHome || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-white/70">Empate</p>
            <p className="text-lg font-bold text-yellow-400">{(match.dynamicOddsDraw || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-white/70">Fora</p>
            <p className="text-lg font-bold text-red-400">{(match.dynamicOddsAway || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Pools e Progresso (Col 10-12) */}
        <div className="md:col-span-3 space-y-1">
          <div className="flex justify-between text-xs text-white/70">
            <span>Pool Casa: {(match.realPoolHome || 0).toFixed(2)} / {(match.minPoolHome || 0).toFixed(2)} USDC</span>
            <span className={isHomeValidated ? 'text-green-400' : 'text-red-400'}>{calculateProgress(match.realPoolHome || 0, match.minPoolHome || 1).toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full">
            <div 
              className="h-1 rounded-full transition-all duration-500" 
              style={{ width: `${calculateProgress(match.realPoolHome || 0, match.minPoolHome || 1)}%`, backgroundColor: isHomeValidated ? '#4ade80' : '#f87171' }}
            ></div>
          </div>
          {/* Barra de Progresso Empate */}
          <div className="flex justify-between text-xs text-white/70">
            <span>Pool Empate: {(match.realPoolDraw || 0).toFixed(2)} / {(match.minPoolDraw || 0).toFixed(2)} USDC</span>
            <span className={isDrawValidated ? 'text-green-400' : 'text-red-400'}>{calculateProgress(match.realPoolDraw || 0, match.minPoolDraw || 1).toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full">
            <div 
              className="h-1 rounded-full transition-all duration-500" 
              style={{ width: `${calculateProgress(match.realPoolDraw || 0, match.minPoolDraw || 1)}%`, backgroundColor: isDrawValidated ? '#4ade80' : '#f87171' }}
            ></div>
          </div>
          {/* Barra de Progresso Fora */}
          <div className="flex justify-between text-xs text-white/70">
            <span>Pool Fora: {(match.realPoolAway || 0).toFixed(2)} / {(match.minPoolAway || 0).toFixed(2)} USDC</span>
            <span className={isAwayValidated ? 'text-green-400' : 'text-red-400'}>{calculateProgress(match.realPoolAway || 0, match.minPoolAway || 1).toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full">
            <div 
              className="h-1 rounded-full transition-all duration-500" 
              style={{ width: `${calculateProgress(match.realPoolAway || 0, match.minPoolAway || 1)}%`, backgroundColor: isAwayValidated ? '#4ade80' : '#f87171' }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer de Validação */}
      <div className="mt-3 pt-3 border-t border-gray-800">
        <p className={`text-xs font-mono ${isFullyValidated ? 'text-green-400' : 'text-yellow-400'}`}>
          {isFullyValidated 
            ? '✅ Partida Validada! Apostas dinâmicas ativas.' 
            : '⚠️ Aguardando liquidez mínima. Apostas limitadas (máx. 10 USDC).'}
        </p>
      </div>
    </Card>
  );
}

// Componente principal da página de jogos
export default function GamesPage() {
  const { matches, isLoading, error, isFeatured, AVAILABLE_LEAGUES } = useMatchData();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list'); // Padrão em lista
  const [activeTab, setActiveTab] = useState('open');
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filtragem e Pesquisa
  const filteredMatches = useMemo(() => {
    let filtered = matches.filter(match => match.status === activeTab);

    // Filtro por Campeonato
    if (selectedLeague !== 'all') {
      filtered = filtered.filter(match => match.league === selectedLeague);
    }

    // Pesquisa por Time
    if (searchTerm) {
      filtered = filtered.filter(match => 
        match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [matches, activeTab, selectedLeague, searchTerm]);

  // Seção de Jogos em Destaque
  const featuredMatches = useMemo(() => {
    return matches.filter(match => isFeatured(match) && match.status === 'open');
  }, [matches, isFeatured]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-white">Carregando partidas...</span>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold text-white mb-6">Jogos em Aberto</h1>

      {/* Barra de Pesquisa e Opções de Visualização */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
          <Input
            type="text"
            placeholder="Pesquisar time..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 bg-gray-900 text-white border-gray-700 focus:border-primary"
          />
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
          <Tabs defaultValue="list" onValueChange={(value) => setViewMode(value as 'list' | 'card')}>
            <TabsList className="bg-gray-900 border border-gray-700">
              <TabsTrigger value="list" className="text-white" title="Visualização em Lista">
                <List className="w-5 h-5" />
              </TabsTrigger>
              <TabsTrigger value="card" className="text-white" title="Visualização em Cards">
                <LayoutGrid className="w-5 h-5" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Filtros de Campeonato (Expansível) */}
      {showFilters && (
        <Card className="p-4 mb-8 bg-gray-900 border-gray-700">
          <h3 className="text-white font-bold mb-3">Filtrar por Campeonato</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedLeague === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedLeague('all')}
              className={selectedLeague === 'all' ? 'cyber-button' : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'}
            >
              Todos
            </Button>
            {AVAILABLE_LEAGUES.map(league => (
              <Button 
                key={league}
                variant={selectedLeague === league ? 'default' : 'outline'}
                onClick={() => setSelectedLeague(league)}
                className={selectedLeague === league ? 'cyber-button' : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'}
              >
                {league}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* JOGOS EM DESTAQUE */}
      {activeTab === 'open' && featuredMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            JOGOS EM DESTAQUE
          </h2>
          <div className="space-y-4">
            {featuredMatches.map(match => (
              <MatchListItem key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* Abas de Status */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-gray-900 border border-gray-700">
          <TabsTrigger value="open" className="text-white">Apostas em Aberto</TabsTrigger>
          <TabsTrigger value="in_progress" className="text-white">Jogos em Progresso</TabsTrigger>
          <TabsTrigger value="finished" className="text-white">Jogos Finalizados</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-4">
          <h2 className="text-2xl font-bold text-white mb-4">Todas as Partidas em Aberto</h2>
          <div className="space-y-4">
            {filteredMatches.length > 0 ? (
              filteredMatches.map(match => (
                <MatchListItem key={match.id} match={match} />
              ))
            ) : (
              <Card className="p-6 text-center bg-gray-900 border-gray-700">
                <p className="text-white/70">Nenhuma partida encontrada com os filtros selecionados.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="in_progress" className="mt-4">
          <h2 className="text-2xl font-bold text-white mb-4">Jogos em Progresso</h2>
          <div className="space-y-4">
            {filteredMatches.length > 0 ? (
              filteredMatches.map(match => (
                <MatchListItem key={match.id} match={match} />
              ))
            ) : (
              <Card className="p-6 text-center bg-gray-900 border-gray-700">
                <p className="text-white/70">Nenhum jogo em progresso encontrado.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="finished" className="mt-4">
          <h2 className="text-2xl font-bold text-white mb-4">Jogos Finalizados</h2>
          <div className="space-y-4">
            {filteredMatches.length > 0 ? (
              filteredMatches.map(match => (
                <MatchListItem key={match.id} match={match} />
              ))
            ) : (
              <Card className="p-6 text-center bg-gray-900 border-gray-700">
                <p className="text-white/70">Nenhum jogo finalizado encontrado.</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
