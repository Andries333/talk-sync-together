import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Phone, MapPin, ArrowUpDown, Download } from 'lucide-react';
import { toast } from "sonner";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  posisie: string | null;
  koshuis: string | null;
  telefoonnommer: string | null;
  studierigting: string | null;
  verjaarsdag: string | null;
}

type SortField = 'name' | 'koshuis' | 'posisie' | 'telefoonnommer';
type SortDirection = 'asc' | 'desc';

const UserTable = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKoshuis, setFilterKoshuis] = useState<string>('');
  const [filterPosisie, setFilterPosisie] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const KOSHUIS_OPTIONS = ['Heldehuis', 'Vaalbos', 'Duiker', 'Steenbok'];
  const POSISIE_OPTIONS = ['HK', 'SR', 'Personeel'];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, filterKoshuis, filterPosisie, sortField, sortDirection]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, posisie, koshuis, telefoonnommer, studierigting, verjaarsdag')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        toast("Fout: Kon nie gebruikers laai nie");
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast("Fout: Kon nie gebruikers laai nie");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const telefoon = (user.telefoonnommer || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || 
               email.includes(search) || 
               telefoon.includes(search);
      });
    }

    // Apply koshuis filter
    if (filterKoshuis && filterKoshuis !== 'all') {
      filtered = filtered.filter(user => user.koshuis === filterKoshuis);
    }

    // Apply posisie filter
    if (filterPosisie && filterPosisie !== 'all') {
      filtered = filtered.filter(user => user.posisie === filterPosisie);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = '';
      let bValue = '';

      switch (sortField) {
        case 'name':
          aValue = `${a.first_name || ''} ${a.last_name || ''}`;
          bValue = `${b.first_name || ''} ${b.last_name || ''}`;
          break;
        case 'koshuis':
          aValue = a.koshuis || '';
          bValue = b.koshuis || '';
          break;
        case 'posisie':
          aValue = a.posisie || '';
          bValue = b.posisie || '';
          break;
        case 'telefoonnommer':
          aValue = a.telefoonnommer || '';
          bValue = b.telefoonnommer || '';
          break;
      }

      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredUsers(filtered);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Naam', 'Email', 'Koshuis', 'Posisie', 'Telefoonnommer', 'Studierigting'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        `"${user.first_name || ''} ${user.last_name || ''}"`,
        `"${user.email || ''}"`,
        `"${user.koshuis || ''}"`,
        `"${user.posisie || ''}"`,
        `"${user.telefoonnommer || ''}"`,
        `"${user.studierigting || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'bko-gebruikers.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 p-2 hover:bg-muted/50"
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laai gebruikers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Gebruiker Lys</CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'gebruiker' : 'gebruikers'}
            </Badge>
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Uitvoer CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Soek naam, email of telefoon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterKoshuis} onValueChange={setFilterKoshuis}>
            <SelectTrigger>
              <SelectValue placeholder="Filter op koshuis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle koshuise</SelectItem>
              {KOSHUIS_OPTIONS.map((koshuis) => (
                <SelectItem key={koshuis} value={koshuis}>
                  {koshuis}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPosisie} onValueChange={setFilterPosisie}>
            <SelectTrigger>
              <SelectValue placeholder="Filter op posisie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle posisies</SelectItem>
              {POSISIE_OPTIONS.map((posisie) => (
                <SelectItem key={posisie} value={posisie}>
                  {posisie}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setFilterKoshuis('');
              setFilterPosisie('');
            }}
            className="w-full"
          >
            Maak Skoon
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton field="name">Naam</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="koshuis">Koshuis</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="posisie">Posisie</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="telefoonnommer">Telefoonnommer</SortButton>
                </TableHead>
                <TableHead className="hidden lg:table-cell">Email</TableHead>
                <TableHead className="hidden xl:table-cell">Studierigting</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Geen gebruikers gevind nie
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.koshuis ? (
                        <Badge variant="outline" className="bg-accent/10 text-accent">
                          <MapPin className="w-3 h-3 mr-1" />
                          {user.koshuis}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.posisie ? (
                        <Badge 
                          variant="outline" 
                          className={
                            user.posisie === 'HK' ? 'bg-primary/10 text-primary' :
                            user.posisie === 'SR' ? 'bg-secondary/10 text-secondary' :
                            'bg-orange-50 text-orange-700'
                          }
                        >
                          {user.posisie}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.telefoonnommer ? (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="font-mono text-sm">{user.telefoonnommer}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {user.studierigting ? (
                        <span className="text-sm">{user.studierigting}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{filteredUsers.length}</div>
            <div className="text-sm text-muted-foreground">Totaal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {filteredUsers.filter(u => u.posisie === 'HK').length}
            </div>
            <div className="text-sm text-muted-foreground">HK Lede</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {filteredUsers.filter(u => u.posisie === 'SR').length}
            </div>
            <div className="text-sm text-muted-foreground">SR Lede</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredUsers.filter(u => u.posisie === 'Personeel').length}
            </div>
            <div className="text-sm text-muted-foreground">Personeel</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserTable;