export declare const meetingLabelsTable: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "meeting_labels";
    schema: undefined;
    columns: {
        columnIndex: import("drizzle-orm/pg-core").PgColumn<{
            name: "column_index";
            tableName: "meeting_labels";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        label: import("drizzle-orm/pg-core").PgColumn<{
            name: "label";
            tableName: "meeting_labels";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export type MeetingLabel = typeof meetingLabelsTable.$inferSelect;
//# sourceMappingURL=meetingLabels.d.ts.map