using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace JQZHomeCareProject.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "Name", "PasswordHash", "PractitionerId", "Role", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "superadmin@jqz.com", "Super Admin", "100000.JIa07Th2kT4wSDYr8TvzXw==.MgTSH4YdTIoIbXfnbhUaqkiFAfndmXdEorfcD+x/5r8=", null, "SuperAdmin", null },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "middleadmin@jqz.com", "Middle Power Admin", "100000.82XTcj/peRxNQbuB6isD+A==.Gsde6PWtQW+b8N5pxtEkvTkmu6N0hvifAvJ3Jyli5sY=", null, "MiddlePowerAdmin", null },
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "simpleadmin@jqz.com", "Simple Admin", "100000.bOi3I8UEigu4rtqVUy+27Q==.s0OCxW8kVkXBgG5TZ9waUrTIU1jhSHu1JqUf0vIL5XY=", null, "SimpleAdmin", null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));
        }
    }
}
