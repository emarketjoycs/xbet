import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { useCreateMarket } from '@/hooks/useBackendMatches';

export default function CreateMatchForm() {
  const { createMarket, isCreating, error } = useCreateMarket();
  
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [league, setLeague] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [outcomesCount, setOutcomesCount] = useState<'2' | '3'>('3');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!homeTeam || !awayTeam || !league || !matchDate || !matchTime) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    try {
      // Combinar data e hora em timestamp
      const dateTimeString = `${matchDate}T${matchTime}`;
      const startTime = Math.floor(new Date(dateTimeString).getTime() / 1000);

      // Verificar se a data é futura
      const now = Math.floor(Date.now() / 1000);
      if (startTime <= now) {
        toast.error('A data/hora da partida deve ser no futuro');
        return;
      }

      // Criar mercado
      const result = await createMarket(
        startTime,
        parseInt(outcomesCount),
        homeTeam,
        awayTeam,
        league
      );

      toast.success(`Partida criada com sucesso! Market ID: ${result.marketId}`);
      
      // Limpar formulário
      setHomeTeam('');
      setAwayTeam('');
      setLeague('');
      setMatchDate('');
      setMatchTime('');
      setOutcomesCount('3');
    } catch (err) {
      toast.error(error || 'Erro ao criar partida');
      console.error('Erro ao criar partida:', err);
    }
  };

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Criar Partida Manualmente</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Preencha os dados abaixo para criar uma nova partida no smart contract.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="homeTeam" className="text-white">Time da Casa</Label>
            <Input
              id="homeTeam"
              type="text"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              placeholder="Ex: Flamengo"
              className="bg-gray-900 text-white border-gray-600 focus:border-primary mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="awayTeam" className="text-white">Time Visitante</Label>
            <Input
              id="awayTeam"
              type="text"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              placeholder="Ex: Palmeiras"
              className="bg-gray-900 text-white border-gray-600 focus:border-primary mt-1"
              required
            />
          </div>
        </div>

        {/* Campeonato */}
        <div>
          <Label htmlFor="league" className="text-white">Campeonato</Label>
          <Input
            id="league"
            type="text"
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            placeholder="Ex: Brasileirão Série A"
            className="bg-gray-900 text-white border-gray-600 focus:border-primary mt-1"
            required
          />
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="matchDate" className="text-white">Data da Partida</Label>
            <Input
              id="matchDate"
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              className="bg-gray-900 text-white border-gray-600 focus:border-primary mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="matchTime" className="text-white">Horário</Label>
            <Input
              id="matchTime"
              type="time"
              value={matchTime}
              onChange={(e) => setMatchTime(e.target.value)}
              className="bg-gray-900 text-white border-gray-600 focus:border-primary mt-1"
              required
            />
          </div>
        </div>

        {/* Número de Resultados */}
        <div>
          <Label className="text-white mb-2 block">Número de Resultados Possíveis</Label>
          <RadioGroup
            value={outcomesCount}
            onValueChange={(value) => setOutcomesCount(value as '2' | '3')}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="outcomes-2" />
              <Label htmlFor="outcomes-2" className="text-white cursor-pointer">
                2 (Casa ou Fora)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="outcomes-3" />
              <Label htmlFor="outcomes-3" className="text-white cursor-pointer">
                3 (Casa, Empate ou Fora)
              </Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground mt-2">
            {outcomesCount === '2' 
              ? 'Partidas sem possibilidade de empate (ex: NBA, NFL)'
              : 'Partidas com possibilidade de empate (ex: Futebol)'}
          </p>
        </div>

        {/* Botão de Envio */}
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-white h-12"
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando Partida...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Criar Partida
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
