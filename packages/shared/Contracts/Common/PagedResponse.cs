namespace JiraGithubExport.Shared.Contracts.Common;

public class PagedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int TotalItems 
    { 
        get => TotalCount; 
        set => TotalCount = value; 
    }
    public int TotalPages { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public bool HasNext => Page < TotalPages;

    public PagedResponse() { }

    public PagedResponse(List<T> items, int totalCount, int page, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        Page = page;
        PageSize = pageSize;
        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
    }
}

