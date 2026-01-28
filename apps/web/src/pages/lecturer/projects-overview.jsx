// Projects Overview - Lecturer projects management page
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { projectService } from "../../services/projectService.js";
import { commitService } from "../../services/commitService.js";
import { useToast } from "../../components/ui/toast.jsx";

export default function ProjectsOverview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (courseId) {
      loadProjects();
    }
  }, [courseId, filter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      let projectData = [];
      if (filter === 'all') {
        projectData = await projectService.getCourseProjects(courseId);
      } else if (filter === 'sync-error') {
        projectData = await projectService.getCourseProjects(courseId, {
          syncStatus: 'ERROR'
        });
      } else if (filter === 'no-commits-7days') {
        projectData = await commitService.getSilentProjects(courseId, 7);
      } else if (filter === 'inactive-members-14days') {
        projectData = await projectService.getCourseProjects(courseId, {
          hasInactiveMembers: true
        });
      }
      
      setProjects(projectData);
      
      // Get course info
      const enrichedProjects = await projectService.getProjects({ courseId });
      setCourse(enrichedProjects[0]?.course || null);
      
    } catch (err) {
      error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCommits = async (projectId) => {
    try {
      const result = await commitService.syncCommits(projectId);
      success(`Synced ${result.commitsAdded} commits`);
      loadProjects(); // Refresh data
    } catch (err) {
      error('Failed to sync commits');
    }
  };

  const handleViewProjectDetail = (projectId) => {
    navigate(`/lecturer/project/${projectId}`);
  };

  const getLastCommitInfo = (project) => {
    const commits = project.commits || [];
    if (commits.length === 0) return 'No commits';
    
    const lastCommit = commits[0];
    const date = new Date(lastCommit.committedAt);
    const now = new Date();
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    return daysDiff === 0 ? 'Today' : `${daysDiff} days ago`;
  };

  const getSyncStatusBadge = (project) => {
    const integration = project.integration;
    if (!integration) return <Badge variant="outline" size="sm">No Integration</Badge>;
    
    const statusColors = {
      SUCCESS: 'success',
      ERROR: 'error',
      PENDING: 'warning'
    };
    
    return (
      <Badge 
        variant={statusColors[integration.syncStatus] || 'outline'} 
        size="sm"
      >
        {integration.syncStatus}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects Overview</h1>
              <p className="text-gray-600">
                {course ? `${course.code} - ${course.title}` : 'Loading...'}
              </p>
            </div>
            <Button onClick={() => navigate('/lecturer')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All Projects
              </Button>
              <Button
                variant={filter === 'sync-error' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('sync-error')}
              >
                Sync Error
              </Button>
              <Button
                variant={filter === 'no-commits-7days' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('no-commits-7days')}
              >
                No Commits (7 days)
              </Button>
              <Button
                variant={filter === 'inactive-members-14days' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('inactive-members-14days')}
              >
                Inactive Members (14 days)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No projects found for this filter.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Commit</TableHead>
                    <TableHead>Sync Status</TableHead>
                    <TableHead>Team Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map(project => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={project.status === 'ACTIVE' ? 'success' : 'secondary'}
                          size="sm"
                        >
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {getLastCommitInfo(project)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getSyncStatusBadge(project)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {project.team?.length || 0} members
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleSyncCommits(project.id)}
                          >
                            Sync
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleViewProjectDetail(project.id)}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
