import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetProjects } from "../../../features/projects/hooks/useProjects.js";

export function useProjectsOverview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: projectsData, isLoading, refetch } = useGetProjects({ 
    courseId: courseId ? Number(courseId) : undefined 
  });
  
  const projects = projectsData?.items || [];

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = !search || 
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'error' && p.integration?.syncStatus === 'ERROR') ||
        (statusFilter === 'active' && p.status === 'ACTIVE');
        
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const stats = useMemo(() => ({
    total: projects.length,
    success: projects.filter(p => p.integration?.syncStatus === 'SUCCESS').length,
    error: projects.filter(p => p.integration?.syncStatus === 'ERROR').length,
    active: projects.filter(p => p.status === 'ACTIVE').length
  }), [projects]);

  return {
    courseId,
    navigate,
    search, setSearch,
    statusFilter, setStatusFilter,
    projects,
    filteredProjects,
    stats,
    isLoading,
    refetch
  };
}
