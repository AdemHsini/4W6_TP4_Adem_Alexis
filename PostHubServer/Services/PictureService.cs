using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PostHubServer.Data;
using PostHubServer.Models;
using System.Text.RegularExpressions;

namespace PostHubServer.Services
{
    public class PictureService
    {
        private readonly PostHubContext _context;

        public PictureService(PostHubContext context)
        {
            _context = context;
        }

        private bool IsContextNull() => _context == null || _context.Pictures == null;

        public async Task<ActionResult<IEnumerable<int>>> GetPictureIds()
        {
            return await _context.Pictures.Select(p => p.Id).ToListAsync();
        }

        public async Task<ActionResult<Picture?>> AddPicture(Picture p)
        {
            _context.Pictures.Add(p);
            await _context.SaveChangesAsync();
            return p;
        }

        public async Task<Picture?> GetPictureId(int id)
        {
            Picture? picture = await _context.Pictures.FindAsync(id);

            return picture;
        }
    }
}
