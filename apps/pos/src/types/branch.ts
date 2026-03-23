export interface BranchInfo { 
  id: string; 
  nama: string; 
  status: 'active' | 'inactive'; 
  isOwnerPrimary?: boolean; 
}
