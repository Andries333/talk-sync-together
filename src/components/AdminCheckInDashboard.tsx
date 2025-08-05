import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Users, Download, MessageSquare } from 'lucide-react';
import { toast } from "sonner";

interface CheckInData {
  id: string;
  user_id: string;
  mood_rating: number;
  mood_label: string;
  questions_suggestions: string | null;
  check_in_date: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

interface UserStats {
  user_id: string;
  user_name: string;
  total_checkins: number;
  avg_mood: number;
  honorarium_impact: number;
  last_checkin: string;
}

const AdminCheckInDashboard = () => {
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckInData();
  }, [selectedPeriod, selectedUser]);

  const fetchCheckInData = async () => {
    try {
      setLoading(true);

      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Fetch check-ins data
      let query = supabase
        .from('daily_checkins')
        .select('*')
        .gte('check_in_date', startDate.toISOString().split('T')[0])
        .lte('check_in_date', endDate.toISOString().split('T')[0])
        .order('check_in_date', { ascending: false });

      if (selectedUser !== 'all') {
        query = query.eq('user_id', selectedUser);
      }

      const { data: checkInData, error: checkInError } = await query;

      if (checkInError) {
        console.error('Error fetching check-ins:', checkInError);
        toast("Fout: Kon nie incheck data laai nie");
        return;
      }

      // Fetch user profiles separately and combine data
      const userIds = [...new Set(checkInData?.map(item => item.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', userIds);

      // Create a map of user profiles
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Transform data
      const transformedData = checkInData?.map(item => {
        const profile = profilesMap.get(item.user_id);
        return {
          ...item,
          user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Onbekende Gebruiker',
          user_email: profile?.email || ''
        };
      }) || [];

      setCheckIns(transformedData);

      // Calculate user statistics
      await calculateUserStats(transformedData);

    } catch (error) {
      console.error('Error fetching check-in data:', error);
      toast("Fout: Kon nie data laai nie");
    } finally {
      setLoading(false);
    }
  };

  const calculateUserStats = async (checkInData: CheckInData[]) => {
    // Group by user
    const userGroups = checkInData.reduce((groups, checkIn) => {
      const userId = checkIn.user_id;
      if (!groups[userId]) {
        groups[userId] = [];
      }
      groups[userId].push(checkIn);
      return groups;
    }, {} as Record<string, CheckInData[]>);

    const stats: UserStats[] = [];

    for (const [userId, userCheckIns] of Object.entries(userGroups)) {
      const totalCheckIns = userCheckIns.length;
      const avgMood = userCheckIns.reduce((sum, c) => sum + c.mood_rating, 0) / totalCheckIns;
      const lastCheckIn = userCheckIns[0]; // Already sorted by date desc

      // Calculate honorarium impact
      const { data: honorariumImpact } = await supabase.rpc('calculate_monthly_honorarium_impact', {
        p_user_id: userId
      });

      stats.push({
        user_id: userId,
        user_name: lastCheckIn.user_name,
        total_checkins: totalCheckIns,
        avg_mood: avgMood,
        honorarium_impact: honorariumImpact || 0,
        last_checkin: lastCheckIn.check_in_date
      });
    }

    setUserStats(stats.sort((a, b) => b.total_checkins - a.total_checkins));
  };

  const exportToCSV = () => {
    const headers = ['Datum', 'Gebruiker', 'Gemoedstoestand', 'Rating', 'Vrae/Voorstelle'];
    const csvContent = [
      headers.join(','),
      ...checkIns.map(checkIn => [
        checkIn.check_in_date,
        `"${checkIn.user_name}"`,
        `"${checkIn.mood_label}"`,
        checkIn.mood_rating,
        `"${checkIn.questions_suggestions || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bko-daily-checkins-${selectedPeriod}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getMoodColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-50';
    if (rating === 3) return 'text-yellow-600 bg-yellow-50';
    if (rating === 2) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getMoodEmoji = (rating: number) => {
    const emojiMap = { 5: '😊', 4: '🙂', 3: '😐', 2: '😕', 1: '😞' };
    return emojiMap[rating as keyof typeof emojiMap] || '😐';
  };

  // Prepare chart data
  const chartData = checkIns.reduce((acc, checkIn) => {
    const date = checkIn.check_in_date;
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.mood_sum += checkIn.mood_rating;
      existing.count += 1;
      existing.avg_mood = existing.mood_sum / existing.count;
    } else {
      acc.push({
        date,
        mood_sum: checkIn.mood_rating,
        count: 1,
        avg_mood: checkIn.mood_rating
      });
    }
    
    return acc;
  }, [] as any[]).sort((a, b) => a.date.localeCompare(b.date));

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laai incheck data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Daaglikse Incheck Dashboard</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Kies periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Laaste Week</SelectItem>
                  <SelectItem value="month">Laaste Maand</SelectItem>
                  <SelectItem value="quarter">Laaste Kwartaal</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Uitvoer CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">{userStats.length}</div>
            </div>
            <p className="text-sm text-muted-foreground">Aktiewe Gebruikers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">{checkIns.length}</div>
            </div>
            <p className="text-sm text-muted-foreground">Totaal Inchecks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">
                {checkIns.length > 0 ? (checkIns.reduce((sum, c) => sum + c.mood_rating, 0) / checkIns.length).toFixed(1) : '0'}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Gem. Gemoedstoestand</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">
                {checkIns.filter(c => c.questions_suggestions).length}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Met Vrae/Voorstelle</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gemoedstoestand Oor Tyd</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="avg_mood" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gebruiker Statistieke</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {userStats.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{user.user_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.total_checkins} inchecks • Gem: {user.avg_mood.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {user.honorarium_impact.toFixed(1)}% honorarium
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Laaste: {user.last_checkin}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Check-ins Table */}
      <Card>
        <CardHeader>
          <CardTitle>Onlangse Inchecks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Gebruiker</TableHead>
                  <TableHead>Gemoedstoestand</TableHead>
                  <TableHead>Honorarium Impak</TableHead>
                  <TableHead>Vrae/Voorstelle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.slice(0, 20).map((checkIn) => (
                  <TableRow key={checkIn.id}>
                    <TableCell>{checkIn.check_in_date}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{checkIn.user_name}</div>
                        <div className="text-sm text-muted-foreground">{checkIn.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getMoodColor(checkIn.mood_rating)}>
                        {getMoodEmoji(checkIn.mood_rating)} {checkIn.mood_label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Progress 
                        value={(checkIn.mood_rating / 5) * 20} 
                        className="w-20" 
                      />
                    </TableCell>
                    <TableCell>
                      {checkIn.questions_suggestions ? (
                        <div className="max-w-xs truncate" title={checkIn.questions_suggestions}>
                          {checkIn.questions_suggestions}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCheckInDashboard;