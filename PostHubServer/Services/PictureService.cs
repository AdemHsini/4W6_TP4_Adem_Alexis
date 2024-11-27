using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.HttpResults;
using PostHubServer.Data;
using PostHubServer.Models;
using System.Text.RegularExpressions;
using PostHubServer.Models;

namespace PostHubServer.Services
{
    public class PictureService
    {
        private readonly PostHubContext _context;

        public PictureService(PostHubContext context)
        {
            _context = context;
        }

        public async Task<Picture?> GetPictureId(int id)
        {
            if(_context.Pictures == null) return null;

            return await _context.Pictures.FindAsync(id);
        }

        private bool IsContextNull() => _context == null || _context.Pictures == null;

        public async Task<ActionResult<IEnumerable<int>>> GetPictureIds(int commentId)
        {
            return await _context.Comments.Where(c => c.Id == commentId)
                .SelectMany(c => c.Pictures)
                .Select(p => p.Id)
                .ToListAsync();
        }

        public async Task<ActionResult<Picture?>> AddPicture(Picture p)
        {
            _context.Pictures.Add(p);
            await _context.SaveChangesAsync();
            return p;
        }
    }
}
