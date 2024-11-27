using Microsoft.AspNetCore.Http.HttpResults;
using PostHubServer.Data;
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
    }
}
