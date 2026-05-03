using System.Collections.Generic;

namespace TheCuratorsCircle.Models;

public class PagedResult<T>
{
    public List<T> Items { get; init; } = new();
    public bool HasMore { get; init; }
    public string? NextCursor { get; init; }
}
