
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PostHubServer.Models;

namespace PostHubServer.Data
{
    public class PostHubContext : IdentityDbContext<User>
    {
        public PostHubContext (DbContextOptions<PostHubContext> options) : base(options){}

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<IdentityRole>().HasData(
                new IdentityRole { Id = "2", Name = "moderator", NormalizedName = "MODERATOR" }
            );

            PasswordHasher<User> passwordHasher = new PasswordHasher<User>();
            User u2 = new User
            {
                Id = "22222222-2222-2222-2222-222222222222",
                UserName = "UserModo",
                NormalizedUserName = "USERMODO",
                Email = "a@a.a",
                NormalizedEmail = "A@A.A"
            };
            u2.PasswordHash = passwordHasher.HashPassword(u2, "1234");

            builder.Entity<User>().HasData(u2);

            builder.Entity<IdentityUserRole<string>>().HasData(
                new IdentityUserRole<string> { UserId = u2.Id, RoleId = "2" }
            );
        }

        public DbSet<Hub> Hubs { get; set; } = default!;
        public DbSet<Comment> Comments { get; set; } = default!;
        public DbSet<Picture> Pictures { get; set; } = default!;
        public DbSet<Post> Posts { get; set; } = default!;
    }
}
