using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using System.Collections.Generic;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Implementations;

/// <summary>
/// Enhanced generic repository implementation with performance options and soft-delete handling.
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    protected readonly JiraGithubToolDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public GenericRepository(JiraGithubToolDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    /// <summary>Standard repository query (filtered by soft-delete in DbContext)</summary>
    public virtual IQueryable<T> Query(bool asNoTracking = false)
    {
        IQueryable<T> query = _dbSet;
        return asNoTracking ? query.AsNoTracking() : query;
    }

    /// <summary>Query including soft-deleted records (bypassing DbContext query filter)</summary>
    public virtual IQueryable<T> QueryRaw(bool asNoTracking = false)
    {
        IQueryable<T> query = _dbSet.IgnoreQueryFilters();
        return asNoTracking ? query.AsNoTracking() : query;
    }

    public virtual async Task<T?> GetByIdAsync(long id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync(bool asNoTracking = false)
    {
        return await Query(asNoTracking).ToListAsync();
    }

    public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, bool asNoTracking = false)
    {
        return await Query(asNoTracking).Where(predicate).ToListAsync();
    }

    public virtual async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, bool asNoTracking = false)
    {
        return await Query(asNoTracking).FirstOrDefaultAsync(predicate);
    }

    public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.AnyAsync(predicate);
    }

    public virtual async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
    {
        if (predicate == null)
            return await _dbSet.CountAsync();
        
        return await _dbSet.CountAsync(predicate);
    }

    public virtual void Add(T entity)
    {
        _dbSet.Add(entity);
    }

    public virtual void AddRange(IEnumerable<T> entities)
    {
        _dbSet.AddRange(entities);
    }

    public virtual void Update(T entity)
    {
        _dbSet.Update(entity);
    }

    public virtual void Remove(T entity)
    {
        _dbSet.Remove(entity);
    }

    public virtual void RemoveRange(IEnumerable<T> entities)
    {
        _dbSet.RemoveRange(entities);
    }

    public virtual async Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        Expression<Func<T, bool>>? filter = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        bool asNoTracking = true)
    {
        IQueryable<T> query = Query(asNoTracking);

        if (filter != null)
            query = query.Where(filter);

        var totalCount = await query.CountAsync();

        if (orderBy != null)
            query = orderBy(query);

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}

