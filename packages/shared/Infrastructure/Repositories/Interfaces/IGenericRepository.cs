using System.Linq.Expressions;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;

/// <summary>
/// Enhanced generic repository interface with performance options.
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public interface IGenericRepository<T> where T : class
{
    /// <summary>Get a queryable for the entity. Use asNoTracking=true for optimized read-only queries.</summary>
    IQueryable<T> Query(bool asNoTracking = false);
    
    /// <summary>Query including soft-deleted records (internal/admin use)</summary>
    IQueryable<T> QueryRaw(bool asNoTracking = false);

    Task<T?> GetByIdAsync(long id);
    Task<IEnumerable<T>> GetAllAsync(bool asNoTracking = false);
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, bool asNoTracking = false);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, bool asNoTracking = false);
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);
    
    void Add(T entity);
    void AddRange(IEnumerable<T> entities);
    void Update(T entity);
    void Remove(T entity);
    void RemoveRange(IEnumerable<T> entities);
    
    Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        Expression<Func<T, bool>>? filter = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        bool asNoTracking = true);
}
