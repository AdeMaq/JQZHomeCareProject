using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JQZHomeCareProject.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceTimeSlotWithSlotRange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TimeSlot",
                table: "Visits");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "SlotEnd",
                table: "Visits",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "SlotStart",
                table: "Visits",
                type: "time",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SlotEnd",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "SlotStart",
                table: "Visits");

            migrationBuilder.AddColumn<string>(
                name: "TimeSlot",
                table: "Visits",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }
    }
}
