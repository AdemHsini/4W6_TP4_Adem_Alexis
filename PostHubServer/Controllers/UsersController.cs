using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using PostHubServer.Models;
using PostHubServer.Models.DTOs;
using PostHubServer.Services;
using SixLabors.ImageSharp;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PostHubServer.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        readonly UserManager<User> _userManager;

        public UsersController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        [HttpPost]
        public async Task<ActionResult> Register(RegisterDTO register)
        {
            if (register.Password != register.PasswordConfirm)
            {
                return StatusCode(StatusCodes.Status400BadRequest,
                    new { Message = "Les deux mots de passe spécifiés sont différents." });
            }
            User user = new User()
            {
                UserName = register.Username,
                Email = register.Email
            };
            IdentityResult identityResult = await _userManager.CreateAsync(user, register.Password);
            if (!identityResult.Succeeded)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { Message = "La création de l'utilisateur a échoué." });
            }
            return Ok(new { Message = "Inscription réussie ! 🥳" });
        }

        [HttpPost]
        public async Task<ActionResult> Login(LoginDTO login)
        {
            User? user = await _userManager.FindByNameAsync(login.Username) ?? await _userManager.FindByEmailAsync(login.Username);
            if (user != null && await _userManager.CheckPasswordAsync(user, login.Password))
            {
                IList<string> roles = await _userManager.GetRolesAsync(user);
                List<Claim> authClaims = new List<Claim>();
                foreach (string role in roles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, role));
                }
                authClaims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id));
                SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8
                    .GetBytes("LooOOongue Phrase SiNoN Ça ne Marchera PaAaAAAaAas !"));
                JwtSecurityToken token = new JwtSecurityToken(
                    issuer: "https://localhost:7216",
                    audience: "http://localhost:4200",
                    claims: authClaims,
                    expires: DateTime.Now.AddMinutes(300),
                    signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
                    );
                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    validTo = token.ValidTo,
                    username = user.UserName // Ceci sert déjà à afficher / cacher certains boutons côté Angular
                });
            }
            else
            {
                return StatusCode(StatusCodes.Status400BadRequest,
                    new { Message = "Le nom d'utilisateur ou le mot de passe est invalide." });
            }
        }

        [HttpPut("{name}")]
        public async Task<ActionResult> Update(string name)
        {
            User? user = await _userManager.FindByNameAsync(name);
            if (user != null)
            {
                IFormCollection formCollection = await Request.ReadFormAsync();
                IFormFile? file = formCollection.Files.GetFile("image");

                if (file != null)
                {
                    Image image = Image.Load(file.OpenReadStream());

                    Picture p = new Picture
                    {
                        Id = 0,
                        FileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName),
                        MimeType = file.ContentType
                    };

                    image.Save(Directory.GetCurrentDirectory() + "/images/avatar/" + p.FileName);

                    user.FileName = p.FileName;

                    user.MimeType = file.ContentType;

                    await _userManager.UpdateAsync(user);
                }

            }
            return Ok();
        }

        [HttpGet("{name}")]
        public async Task<ActionResult<IEnumerable<int>>> GetUserPicture(string name)
        {
            User? user = await _userManager.FindByNameAsync(name);
            
            if (user != null)
            {
                if (user.FileName == null)
                {
                    byte[] bytesDefault = System.IO.File.ReadAllBytes(Directory.GetCurrentDirectory() + "/images/avatar/default.png");
                    return File(bytesDefault, "image/png");
                }
                if (user.MimeType != null)
                {
                    byte[] bytes = System.IO.File.ReadAllBytes(Directory.GetCurrentDirectory() + "/images/avatar/" + user.FileName);
                    return File(bytes, user.MimeType);
                }
            }
            return StatusCode(StatusCodes.Status404NotFound,
                    new { Message = "Le nom d'utilisateur introuvable." });
        }

        [HttpPost]
        public async Task<ActionResult> ChangePassword(ChangePasswordDTO changePasswordDTO)
        {
            User? user = await _userManager.FindByNameAsync(changePasswordDTO.Username);
            if(user == null)
            {
                return StatusCode(StatusCodes.Status404NotFound,
                    new { Message = "L'utilisateur n'existe pas." });
            }
            IdentityResult result = await _userManager.ChangePasswordAsync(user, changePasswordDTO.oldPassword, changePasswordDTO.NewPassword);
            if (!result.Succeeded)
            {
                return StatusCode(StatusCodes.Status400BadRequest, new { Message = "Le changement de mot de passe a échoué." });
            }
            return Ok(new { Message = "Le mot de passe a été changé avec succès." });
        }
    }
}
