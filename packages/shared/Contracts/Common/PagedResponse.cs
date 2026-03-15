namespace JiraGithubExport.Shared.Contracts.Common;

public class PagedResponse<T>
{
    public List<T> Items { get; set; } = new();
<<<<<<< HEAD
    public int TotalItems { get; set; }
=======
    public int TotalCount { get; set; }
>>>>>>> origin
    public int TotalPages { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public bool HasNext => Page < TotalPages;

    public PagedResponse() { }

<<<<<<< HEAD
    public PagedResponse(List<T> items, int totalItems, int page, int pageSize)
    {
        Items = items;
        TotalItems = totalItems;
        Page = page;
        PageSize = pageSize;
        TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
=======
    public PagedResponse(List<T> items, int totalCount, int page, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        Page = page;
        PageSize = pageSize;
        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
>>>>>>> origin
    }
}
